import { Op } from 'sequelize';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Property from '../models/Property';
import User from '../models/User';
import Person from '../models/Person';
import PropertyUser from '../models/PropertyUser';
import BlockedUser from '../models/BlockedUser';
import { CreateMessageInput, UpdateMessageInput } from '../schemas/chatsSchema';
import TwilioWhatsAppService from './TwilioWhatsAppService';
import { ConversationWithParticipants } from '../types/ConversationAttributes';


function isParticipant(conversation: Conversation, userId: number): boolean {
    return conversation.userRequesterId === userId || conversation.userOwnerId === userId;
}

function publicMessage(message: Message) {
    const plain = message.get({ plain: true }) as any;
    return {
        ...plain,
        content: plain.isDeleted ? null : plain.content,
        imageUrl: plain.isDeleted ? null : plain.imageUrl,
    };
}

function conversationIdentifier(conversation: ConversationWithParticipants): string {
    const requesterEmail = conversation.requester?.email || 'requester';
    const ownerEmail = conversation.owner?.email || 'owner';
    return `ids_${conversation.userRequesterId}-${requesterEmail}_${conversation.userOwnerId}-${ownerEmail}`;
}

function participantPayload(user: (User & { person?: Person }) | undefined, role: 'requester' | 'owner') {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.person?.name || 'Sem Nome',
        email: user.email,
        avatarUrl: user.avatarUrl,
        role,
        lastOnline: user.lastOnline || null,
    };
}

function messagePayload(message: Message) {
    return {
        id: message.id,
        senderId: message.senderId,
        content: message.isDeleted ? null : message.content || null,
        imageUrl: message.isDeleted ? null : message.imageUrl || null,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
        createdAt: message.createdAt,
    };
}

export class ChatService {
    static getParticipantIds(conversation: Conversation): number[] {
        return [conversation.userRequesterId, conversation.userOwnerId];
    }

    static async createConversationForReservation(data: {
        solicitationId: number;
        propertyId: number;
        userRequesterId: number;
        userOwnerId: number;
    }) {
        const [conversation] = await Conversation.findOrCreate({
            where: { solicitationId: data.solicitationId },
            defaults: {
                ...data,
                deletedBy: [],
            },
        });

        return conversation;
    }

    static async listUserConversations(userId: number) {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { userRequesterId: userId },
                    { userOwnerId: userId },
                ],
            },
            include: [
                { model: Property, as: 'property', attributes: ['id', 'name'] },
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'email', 'avatarUrl', 'lastOnline'],
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'email', 'avatarUrl', 'lastOnline'],
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                },
                {
                    model: Message,
                    as: 'messages',
                    separate: true,
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                },
            ],
            order: [['updatedAt', 'DESC']],
        }) as ConversationWithParticipants[];

        return conversations
            .filter((conversation) => !(conversation.deletedBy || []).includes(userId))
            .map((conversation) => {
                const requesterIsCurrentUser = conversation.userRequesterId === userId;
                const otherParticipant = requesterIsCurrentUser ? conversation.owner : conversation.requester;
                const lastMessage = conversation.messages?.[0];

                return {
                    id: conversation.id,
                    solicitationId: conversation.solicitationId,
                    propertyId: conversation.propertyId,
                    lastContent: lastMessage
                        ? (lastMessage.isDeleted ? 'Mensagem apagada' : lastMessage.content || (lastMessage.imageUrl ? 'Imagem' : null))
                        : null,
                    avatar_url: otherParticipant?.avatarUrl || null,
                    name: otherParticipant?.person?.name || otherParticipant?.email || 'Usuario',
                    last_online: otherParticipant?.lastOnline || null,
                    subtitle: requesterIsCurrentUser ? conversation.property?.name : 'Solicitante da vaga',
                    otherParticipantId: otherParticipant?.id,
                    updatedAt: conversation.updatedAt,
                };
            });
    }

    static async getMessages(conversationId: number, userId: number, page: number, limit: number) {
        const conversation = await this.getConversationForUser(conversationId, userId);
        const offset = (page - 1) * limit;

        const { rows, count } = await Message.findAndCountAll({
            where: { conversationId: conversation.id },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'email', 'avatarUrl'],
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            conversationId: conversation.id,
            page,
            limit,
            total: count,
            data: rows.reverse().map(publicMessage),
        };
    }

    static async getConversationDetail(conversationId: number, userId: number, page: number, limit: number) {
        await this.getConversationForUser(conversationId, userId);
        const offset = (page - 1) * limit;

        const conversation = await Conversation.findByPk(conversationId, {
            include: [
                { model: Property, as: 'property', attributes: ['id', 'name'] },
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'email', 'avatarUrl', 'lastOnline'],
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'email', 'avatarUrl', 'lastOnline'],
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                },
            ],
        }) as ConversationWithParticipants | null;

        if (!conversation) {
            throw new Error('CONVERSATION_NOT_FOUND');
        }

        const messages = await Message.findAll({
            where: { conversationId: conversation.id },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        const requester = participantPayload(conversation.requester, 'requester');
        const owner = participantPayload(conversation.owner, 'owner');
        const users: Record<string, ReturnType<typeof participantPayload>> = {};

        if (requester) {
            users[String(requester.id)] = requester;
        }

        if (owner) {
            users[String(owner.id)] = owner;
        }

        return {
            conversation: {
                id: conversation.id,
                identifier: conversationIdentifier(conversation),
                property: {
                    id: conversation.property?.id,
                    name: conversation.property?.name,
                },
            },
            users,
            messages: messages.reverse().map(messagePayload),
        };
    }

    static async searchMessages(conversationId: number, userId: number, query: string, page: number, limit: number) {
        const conversation = await this.getConversationForUser(conversationId, userId);
        const offset = (page - 1) * limit;

        const { rows, count } = await Message.findAndCountAll({
            where: {
                conversationId: conversation.id,
                isDeleted: false,
                content: { [Op.iLike]: `%${query}%` },
            },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            conversationId: conversation.id,
            query,
            page,
            limit,
            total: count,
            data: rows.map(messagePayload),
        };
    }

    static async createMessage(conversationId: number, senderId: number, data: CreateMessageInput) {
        const conversation = await this.getConversationForUser(conversationId, senderId);
        await this.ensureConversationNotBlocked(conversation);

        const message = await Message.create({
            conversationId,
            senderId,
            content: data.content || null,
            imageUrl: data.image_url || null,
            isEdited: false,
            isDeleted: false,
        });

        await conversation.update({
            deletedBy: [],
            updatedAt: new Date(),
        });

        const loaded = await this.getMessageById(message.id);
        this.notifyChatRecipient(conversation, senderId);

        return {
            message: publicMessage(loaded),
            participantIds: this.getParticipantIds(conversation),
        };
    }

    static async updateMessage(messageId: number, userId: number, data: UpdateMessageInput) {
        const message = await this.getMessageById(messageId);
        const conversation = await this.getConversationForUser(message.conversationId, userId);

        if (message.senderId !== userId) {
            throw new Error('MESSAGE_NOT_YOURS');
        }

        if (message.isDeleted) {
            throw new Error('MESSAGE_ALREADY_DELETED');
        }

        await message.update({
            content: data.content,
            isEdited: true,
        });
        await conversation.update({ updatedAt: new Date() });

        const loaded = await this.getMessageById(message.id);
        return {
            message: publicMessage(loaded),
            participantIds: this.getParticipantIds(conversation),
        };
    }

    static async deleteMessage(messageId: number, userId: number) {
        const message = await this.getMessageById(messageId);
        const conversation = await this.getConversationForUser(message.conversationId, userId);

        await message.update({
            content: null,
            imageUrl: null,
            isDeleted: true,
        });
        await conversation.update({ updatedAt: new Date() });

        const loaded = await this.getMessageById(message.id);
        return {
            message: publicMessage(loaded),
            participantIds: this.getParticipantIds(conversation),
        };
    }

    static async deleteMultiple(conversationIds: number[], userId: number) {
        const conversations = await Conversation.findAll({
            where: {
                id: conversationIds,
                [Op.or]: [
                    { userRequesterId: userId },
                    { userOwnerId: userId },
                ],
            },
        });

        await Promise.all(conversations.map((conversation) => {
            const deletedBy = Array.from(new Set([...(conversation.deletedBy || []), userId]));
            return conversation.update({ deletedBy });
        }));

        return {
            deletedCount: conversations.length,
            conversationIds: conversations.map((conversation) => conversation.id),
        };
    }

    static async deleteForEveryone(conversationId: number, userId: number) {
        const conversation = await this.getConversationForUser(conversationId, userId);
        const participantIds = this.getParticipantIds(conversation);

        await conversation.update({
            deletedBy: participantIds,
        });

        return {
            conversationId: conversation.id,
            participantIds,
        };
    }

    static async blockUser(blockerId: number, blockedId: number) {
        if (blockerId === blockedId) {
            throw new Error('BLOCK_SELF_NOT_ALLOWED');
        }

        const blocked = await User.findByPk(blockedId);
        if (!blocked) {
            throw new Error('USER_NOT_FOUND');
        }

        const [block] = await BlockedUser.findOrCreate({
            where: { blockerId, blockedId },
            defaults: { blockerId, blockedId },
        });

        return block;
    }

    static async unblockUser(blockerId: number, blockedId: number) {
        const deletedCount = await BlockedUser.destroy({
            where: { blockerId, blockedId },
        });

        return {
            blockedId,
            deletedCount,
        };
    }

    static async getConversationForSocket(conversationId: number, userId: number) {
        return this.getConversationForUser(conversationId, userId);
    }

    private static async ensureConversationNotBlocked(conversation: Conversation) {
        const block = await BlockedUser.findOne({
            where: {
                [Op.or]: [
                    { blockerId: conversation.userRequesterId, blockedId: conversation.userOwnerId },
                    { blockerId: conversation.userOwnerId, blockedId: conversation.userRequesterId },
                ],
            },
        });

        if (block) {
            throw new Error('CHAT_BLOCKED');
        }
    }

    private static async getConversationForUser(conversationId: number, userId: number) {
        const conversation = await Conversation.findByPk(conversationId);

        if (!conversation) {
            throw new Error('CONVERSATION_NOT_FOUND');
        }

        if (!isParticipant(conversation, userId)) {
            throw new Error('CONVERSATION_ACCESS_DENIED');
        }

        return conversation;
    }

    private static async getMessageById(messageId: number) {
        const message = await Message.findByPk(messageId, {
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'email', 'avatarUrl'],
                    include: [{ model: Person, as: 'person', attributes: ['name'] }]
                }
            ],
        });

        if (!message) {
            throw new Error('MESSAGE_NOT_FOUND');
        }

        return message;
    }

    static async findOwnerByProperty(propertyId: number) {
        return PropertyUser.findOne({
            where: {
                propertyId,
                role: 'DONO',
            },
        });
    }

    private static notifyChatRecipient(conversation: Conversation, senderId: number): void {
        const recipientId =
            conversation.userRequesterId === senderId
                ? conversation.userOwnerId
                : conversation.userRequesterId;

        TwilioWhatsAppService.dispatchInBackground(async () => {
            const [recipient, sender] = await Promise.all([
                User.findByPk(recipientId, { include: [{ model: Person, as: 'person' }] }),
                User.findByPk(senderId, { include: [{ model: Person, as: 'person' }] }),
            ]);

            if (!recipient?.person?.phone || !sender?.person?.name) {
                throw new Error('NOTIFICATION_CONTEXT_NOT_FOUND');
            }

            return TwilioWhatsAppService.sendNewChatMessage(
                recipient.person.phone,
                sender.person.name,
                conversation.id
            );
        });
    }
}

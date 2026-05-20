import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ChatService } from '../services/ChatService';
import { blockUserSchema, createMessageSchema, deleteMultipleChatsSchema, paginationSchema, searchMessagesSchema, updateMessageSchema } from '../schemas/chatsSchema';
import { emitToUsers } from '../utils/socket';
import { ImageService } from '../services/ImageService';

export const listChats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ChatService.listUserConversations(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

export const getChatById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const conversationId = Number(req.params.conversationId);
    const pagination = paginationSchema.parse(req.query);
    const data = await ChatService.getConversationDetail(conversationId, userId, pagination.page, pagination.limit);

    res.status(200).json(data);
});

export const searchChatMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const conversationId = Number(req.params.conversationId);
    const query = searchMessagesSchema.parse(req.query);
    const data = await ChatService.searchMessages(conversationId, userId, query.q, query.page, query.limit);

    res.status(200).json({ success: true, ...data });
});

export const createChatMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const conversationId = Number(req.params.conversationId);

    let imageUrl = req.body?.image_url;
    if (req.file) {
        const upload = await ImageService.uploadChatImage({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
        }, userId);
        imageUrl = upload.secure_url;
    }

    const body = createMessageSchema.parse({
        content: req.body?.content,
        image_url: imageUrl,
    });
    const result = await ChatService.createMessage(conversationId, userId, body);

    emitToUsers(result.participantIds, 'send_message', {
        conversationId,
        message: result.message,
    });

    res.status(201).json({ success: true, data: result.message });
});

export const updateChatMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const messageId = Number(req.params.messageId);
    const body = updateMessageSchema.parse(req.body);
    const result = await ChatService.updateMessage(messageId, userId, body);

    emitToUsers(result.participantIds, 'edit_message', {
        message: result.message,
    });

    res.status(200).json({ success: true, data: result.message });
});

export const deleteChatMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const messageId = Number(req.params.messageId);
    const result = await ChatService.deleteMessage(messageId, userId);

    emitToUsers(result.participantIds, 'delete_message', {
        message: result.message,
    });

    res.status(200).json({ success: true, data: result.message });
});

export const deleteMultipleChats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const body = deleteMultipleChatsSchema.parse(req.body);
    const data = await ChatService.deleteMultiple(body.conversationIds, userId);

    res.status(200).json({ success: true, data });
});

export const deleteChatForEveryone = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const conversationId = Number(req.params.conversationId);
    const data = await ChatService.deleteForEveryone(conversationId, userId);

    emitToUsers(data.participantIds, 'delete_conversation', {
        conversationId,
    });

    res.status(200).json({ success: true, data });
});

export const blockChatUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const body = blockUserSchema.parse(req.body);
    const data = await ChatService.blockUser(userId, body.blockedUserId);

    res.status(201).json({
        success: true,
        message: 'Usuario bloqueado com sucesso',
        data,
    });
});

export const unblockChatUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const blockedUserId = Number(req.params.userId);
    const data = await ChatService.unblockUser(userId, blockedUserId);

    res.status(200).json({
        success: true,
        message: 'Usuario desbloqueado com sucesso',
        data,
    });
});

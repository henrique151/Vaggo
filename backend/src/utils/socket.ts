import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import User from '../models/User';
import { ChatService } from '../services/ChatService';
import { createMessageSchema, updateMessageSchema } from '../schemas/chatsSchema';

let io: Server | null = null;
const onlineConnections = new Map<number, number>();

type AuthenticatedSocket = Socket & {
    userId?: number;
};

function extractToken(socket: Socket): string | null {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
        return authToken.replace(/^Bearer\s+/i, '');
    }

    const header = socket.handshake.headers.authorization;
    if (typeof header === 'string' && header.trim()) {
        return header.replace(/^Bearer\s+/i, '');
    }

    return null;
}

function authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void) {
    const token = extractToken(socket);

    if (!token) {
        return next(new Error('Token nao fornecido'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-segredo') as { id: string };
        socket.userId = Number(decoded.id);
        next();
    } catch (_error) {
        next(new Error('Token invalido ou expirado'));
    }
}

export function initSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3001',
            credentials: true,
        },
    });

    io.use(authenticateSocket);

    io.on('connection', (socket: AuthenticatedSocket) => {
        const userId = Number(socket.userId);
        socket.join(`user:${userId}`);

        const currentCount = onlineConnections.get(userId) || 0;
        onlineConnections.set(userId, currentCount + 1);

        if (currentCount === 0) {
            io?.emit('user_status', { userId, isOnline: true, lastOnline: null });
        }

        socket.on('send_message', async (payload, callback) => {
            try {
                const body = createMessageSchema.parse(payload);
                const conversationId = Number(payload?.conversationId);
                const result = await ChatService.createMessage(conversationId, userId, body);

                emitToUsers(result.participantIds, 'send_message', {
                    conversationId,
                    message: result.message,
                });
                callback?.({ success: true, data: result.message });
            } catch (error: any) {
                callback?.({ success: false, message: error.message });
            }
        });

        socket.on('edit_message', async (payload, callback) => {
            try {
                const body = updateMessageSchema.parse(payload);
                const messageId = Number(payload?.messageId);
                const result = await ChatService.updateMessage(messageId, userId, body);

                emitToUsers(result.participantIds, 'edit_message', {
                    message: result.message,
                });
                callback?.({ success: true, data: result.message });
            } catch (error: any) {
                callback?.({ success: false, message: error.message });
            }
        });

        socket.on('delete_message', async (payload, callback) => {
            try {
                const messageId = Number(payload?.messageId);
                const result = await ChatService.deleteMessage(messageId, userId);

                emitToUsers(result.participantIds, 'delete_message', {
                    message: result.message,
                });
                callback?.({ success: true, data: result.message });
            } catch (error: any) {
                callback?.({ success: false, message: error.message });
            }
        });

        socket.on('typing', async (payload, callback) => {
            try {
                const conversationId = Number(payload?.conversationId);
                const isTyping = Boolean(payload?.isTyping);
                const conversation = await ChatService.getConversationForSocket(conversationId, userId);
                const participantIds = ChatService.getParticipantIds(conversation);

                emitToUsers(participantIds.filter((participantId) => participantId !== userId), 'typing', {
                    conversationId,
                    userId,
                    isTyping,
                });
                callback?.({ success: true });
            } catch (error: any) {
                callback?.({ success: false, message: error.message });
            }
        });

        socket.on('disconnect', async () => {
            const nextCount = Math.max((onlineConnections.get(userId) || 1) - 1, 0);

            if (nextCount > 0) {
                onlineConnections.set(userId, nextCount);
                return;
            }

            onlineConnections.delete(userId);
            const lastOnline = new Date();
            await User.update({ lastOnline }, { where: { id: userId } });
            io?.emit('user_status', { userId, isOnline: false, lastOnline });
        });
    });

    return io;
}

export function emitToUsers(userIds: number[], event: string, payload: unknown) {
    if (!io) {
        return;
    }

    userIds.forEach((userId) => {
        io?.to(`user:${userId}`).emit(event, payload);
    });
}

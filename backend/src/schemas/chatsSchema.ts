import { z } from 'zod';

const optionalMessageText = z.string().trim().max(2000).optional();
const optionalImageUrl = z.string().trim().url().max(255).optional();

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(30),
});

export const createMessageSchema = z.object({
    content: optionalMessageText,
    image_url: optionalImageUrl,
}).refine((data) => Boolean(data.content || data.image_url), {
    message: 'Mensagem deve conter texto ou imagem',
});

export const updateMessageSchema = z.object({
    content: z.string().trim().min(1).max(2000),
});

export const deleteMultipleChatsSchema = z.object({
    conversationIds: z.array(z.coerce.number().int().positive()).min(1),
});

export const searchMessagesSchema = paginationSchema.extend({
    q: z.string().trim().min(1).max(100),
});

export const blockUserSchema = z.object({
    blockedUserId: z.coerce.number().int().positive(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type DeleteMultipleChatsInput = z.infer<typeof deleteMultipleChatsSchema>;
export type SearchMessagesInput = z.infer<typeof searchMessagesSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;

import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
    blockChatUser,
    createChatMessage,
    deleteChatForEveryone,
    deleteChatMessage,
    deleteMultipleChats,
    getChatById,
    listChats,
    searchChatMessages,
    unblockChatUser,
    updateChatMessage,
} from '../controllers/chatsController';
import { uploadChatSingle } from '../middlewares/upload';

const router = Router();

router.get('/', authMiddleware, listChats);
router.post('/block', authMiddleware, blockChatUser);
router.delete('/block/:userId', authMiddleware, unblockChatUser);
router.get('/:conversationId/search', authMiddleware, searchChatMessages);
router.get('/:conversationId', authMiddleware, getChatById);
router.post('/:conversationId/messages', authMiddleware, uploadChatSingle, createChatMessage);
router.put('/messages/:messageId', authMiddleware, updateChatMessage);
router.delete('/messages/:messageId', authMiddleware, deleteChatMessage);
router.post('/delete-multiple', authMiddleware, deleteMultipleChats);
router.delete('/:conversationId/for-everyone', authMiddleware, deleteChatForEveryone);

export default router;

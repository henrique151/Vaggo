import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { refreshAccessToken, logout } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', authMiddleware, logout);

export default router;


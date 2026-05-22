import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { confirmForgotPassword, confirmRegistration, forgotPassword, login, refreshAccessToken, resetForgotPassword, logout, resendRegistrationCode } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validateBody';
import { confirmForgotPasswordSchema, confirmRegistrationSchema, forgotPasswordSchema, loginSchema, resetForgotPasswordSchema } from '../schemas/authSchema';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/register/resend', authLimiter, validateBody(forgotPasswordSchema), resendRegistrationCode);
router.post('/register/confirm', authLimiter, validateBody(confirmRegistrationSchema), confirmRegistration);
router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/forgot-password/confirm', authLimiter, validateBody(confirmForgotPasswordSchema), confirmForgotPassword);
router.post('/forgot-password/reset', authLimiter, validateBody(resetForgotPasswordSchema), resetForgotPassword);
router.post('/logout', authMiddleware, logout);

export default router;


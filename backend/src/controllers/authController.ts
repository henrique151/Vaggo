import { Response, Request } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AuthService } from '../services/AuthService';
import {
    ConfirmRegistrationInput,
    ResendRegistrationInput,
    ForgotPasswordInput,
    LoginInput,
    ResetForgotPasswordInput,
} from '../schemas/authSchema';

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;
    const data = await AuthService.authenticate(email, password);

    res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
            accessToken: data.accessToken,
            expiresIn: data.expiresIn,
            user: data.user,
        },
    });
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new Error('NO_REFRESH_TOKEN');
    }

    const data = await AuthService.refreshAccessTokenFromRequest(refreshToken, req.headers.authorization);

    res.status(200).json({
        success: true,
        data: {
            accessToken: data.accessToken,
            expiresIn: data.expiresIn,
        },
    });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id ? Number(req.user.id) : undefined;
    if (!userId) {
        throw new Error('USER_NOT_FOUND');
    }

    await AuthService.logout(userId);

    res.clearCookie('refreshToken');

    res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
    });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordInput;
    const data = await AuthService.requestPasswordReset(email);

    res.status(200).json({
        success: true,
        message: 'Instruções de recuperação enviadas por e-mail',
        data,
    });
});

export const resendRegistrationCode = asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.body as ResendRegistrationInput;
    const data = await AuthService.resendRegistrationOtp(identifier);

    res.status(200).json({
        success: true,
        message: 'Código de confirmação enviado por e-mail',
        data,
    });
});

export const resetForgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body as ResetForgotPasswordInput;
    await AuthService.resetPasswordWithToken(resetToken, newPassword);

    res.status(200).json({
        success: true,
        message: 'Senha atualizada com sucesso',
    });
});

export const confirmRegistration = asyncHandler(async (req: Request, res: Response) => {
    const { email, code } = req.body as ConfirmRegistrationInput;
    const data = await AuthService.confirmRegistrationOtp(email, code);

    res.status(200).json({
        success: true,
        message: 'Cadastro confirmado com sucesso',
        data,
    });
});

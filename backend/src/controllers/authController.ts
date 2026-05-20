import { Response, Request } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'super-segredo';

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new Error('NO_REFRESH_TOKEN');
    }

    // Extract user ID from Authorization header (access token) or decode the cookie
    const authHeader = req.headers.authorization;
    let userId: number | undefined;

    if (authHeader) {
        const [, token] = authHeader.split(' ');
        try {
            const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { id: string };
            userId = Number(decoded.id);
        } catch {
            // Access token might be expired, try to decode without verification
            try {
                const decoded = jwt.decode(token) as { id: string } | null;
                if (decoded) userId = Number(decoded.id);
            } catch {
                throw new Error('USER_NOT_FOUND');
            }
        }
    }

    if (!userId) {
        throw new Error('USER_NOT_FOUND');
    }

    const data = await UserService.refreshAccessToken(userId, refreshToken);

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

    await UserService.logout(userId);

    res.clearCookie('refreshToken');

    res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
    });
});


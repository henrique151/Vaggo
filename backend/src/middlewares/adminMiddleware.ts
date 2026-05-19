import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import User from '../models/User';

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.user?.id);
        const user = await User.findByPk(userId);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Sem permissao para realizar esta acao.' });
        }

        next();
    } catch (error) {
        next(error);
    }
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Roles } from '../types/Roles';

export const allowSelfOrRoles = (paramName: string, ...allowedRoles: Roles[]) =>
    (req: AuthRequest, res: Response, next: NextFunction) => {
        const authUser = req.user;
        const resourceUserId = Number(req.params[paramName]);

        if (!authUser || !Number.isInteger(resourceUserId)) {
            return res.status(403).json({ success: false, message: 'Sem permissao para realizar esta ação.' });
        }

        if (authUser.id === resourceUserId || allowedRoles.includes(authUser.role)) {
            return next();
        }

        return res.status(403).json({ success: false, message: 'Sem permissao para realizar esta ação' });
    };

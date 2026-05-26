import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Roles } from '../types/Roles';

export const permissionMiddleware = (...allowedRoles: Roles[]) =>
    (req: AuthRequest, res: Response, next: NextFunction) => {
        const currentRole = req.user?.role;

        if (!currentRole || !allowedRoles.includes(currentRole)) {
            return res.status(403).json({ success: false, message: 'Sem permissao para realizar esta acao.' });
        }

        next();
    };

export const requireAdmin = permissionMiddleware(Roles.ADMIN);
export const requireManager = permissionMiddleware(Roles.ADMIN, Roles.MANAGER);

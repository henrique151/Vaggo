import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Roles } from '../types/Roles';

export const preventRoleMutationByNonAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== Roles.ADMIN && Object.prototype.hasOwnProperty.call(req.body, 'permissionLevel')) {
        return res.status(403).json({
            success: false,
            message: 'Sem permissao para alterar nivel de permissao.',
        });
    }

    next();
};

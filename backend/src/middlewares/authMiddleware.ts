import { Response, NextFunction, Request } from "express";
import jwt from 'jsonwebtoken';
import { Roles } from "../types/Roles";
import User from "../models/User";

export interface AuthRequest extends Request {
    user?: { 
        id: number;
        role: Roles;
    }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Token não fornecido' })
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-segredo') as { id: number, role: Roles };
        
        const user = await User.findByPk(decoded.id, { attributes: ['id', 'isBlocked'] });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Sua conta foi bloqueada. Entre em contato com o suporte para mais informações.'
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
    }
}
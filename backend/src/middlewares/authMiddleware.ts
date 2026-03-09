import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';



export interface AuthRequest extends Request {
    user?: { id: string }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Token não fornecido' })
    }

    // O padrão é "Bearer seutokenaqui", então pegamos a segunda parte
    const [, token] = authHeader.split(' ');

    try {
        // O ideal é que esse 'super-segredo' venha de um arquivo .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-segredo');

        req.user = decoded as { id: string }; // Anexa o ID do usuário na requisição
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
    }
}
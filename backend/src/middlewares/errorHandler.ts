import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Erro na requisição', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno do servidor' : err.message;

    res.status(status).json({
        success: false,
        message,
    })
}

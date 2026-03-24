import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod/v3';

export const validateBody = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Erro de validação',
                    errors: error.errors
                });
            }
            next(error);
        }
    };


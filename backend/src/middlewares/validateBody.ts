import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod/v3';

export const validateBody = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body); // Usar parseAsync é mais seguro
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

// validateBody é um middleware que valida o corpo da requisição (req.body)
// usando um schema do Zod. Ele verifica se os dados enviados pelo cliente
// seguem o formato esperado.
// - Se os dados forem válidos → chama next() e continua a execução da rota.
// - Se houver erro de validação → retorna status 400 com os detalhes do erro.
// - Se ocorrer outro tipo de erro → passa para o middleware de erro com next(error).
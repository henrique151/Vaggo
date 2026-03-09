import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

// asyncHandler é uma função utilitária que recebe uma função assíncrona (async)
// usada em rotas do Express. Ela executa essa função e, caso ocorra algum erro,
// captura automaticamente e envia para o next(), permitindo que o middleware
// de tratamento de erros do Express lide com o problema. Assim evitamos
// precisar escrever try/catch em todas as rotas.
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const BUSINESS_ERRORS: Record<string, number> = {
    INVALID_CREDENTIALS: 401,
    FORBIDDEN: 403,
    MAX_VEHICLES_REACHED: 403,
    PROPERTY_ACCESS_DENIED: 403,
    USER_NOT_FOUND: 404,
    VEHICLE_NOT_FOUND: 404,
    STATE_NOT_FOUND: 404,
    CITY_NOT_FOUND: 404,
    PROPERTY_NOT_FOUND: 404,
    SPOT_NOT_FOUND: 404,
    CPF_ALREADY_EXISTS: 409,
    EMAIL_ALREADY_EXISTS: 409,
    STATE_ALREADY_EXISTS: 409,
    LICENSE_PLATE_ALREADY_EXISTS: 409,
    USER_ALREADY_MEMBER: 409,
    SPOT_ALREADY_EXISTS: 409,
    EXTERNAL_API_FAILURE: 409,
    SPOT_NOT_APPROVED: 422,
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Erro na requisição', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const status = BUSINESS_ERRORS[err.message] ?? err.status ?? 500;

    const messageMap: Record<string, string> = {
        INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
        FORBIDDEN: 'Sem permissão para realizar esta ação.',
        MAX_VEHICLES_REACHED: 'Você atingiu o limite máximo de 3 veículos por conta.',
        PROPERTY_ACCESS_DENIED: 'Você não tem vínculo com a propriedade',
        USER_NOT_FOUND: 'Usuário não encontrado.',
        STATE_NOT_FOUND: 'Estado não encontrado',
        CITY_NOT_FOUND: 'Cidade não encontrada.',
        PROPERTY_NOT_FOUND: 'Propriedade não encontrada.',
        SPOT_NOT_FOUND: 'Vaga não encontrada.',
        CPF_ALREADY_EXISTS: 'CPF já cadastrado.',
        EMAIL_ALREADY_EXISTS: 'E-mail já cadastrado.',
        STATE_ALREADY_EXISTS: 'Estado já cadastrado.',
        LICENSE_PLATE_ALREADY_EXISTS: 'Já existe um veículo cadastrado com esta placa.',
        VEHICLE_NOT_FOUND: 'Veículo não encontrado.',
        USER_ALREADY_MEMBER: 'Usuário já vinculado à propriedade',
        SPOT_ALREADY_EXISTS: 'Vaga duplicada na mesma propriedade',
        EXTERNAL_API_FAILURE: 'Erro no cep.',
        SPOT_NOT_APPROVED: 'A vaga precisa estar com status APROVADA para alterar sua disponibilidade',
    };

    const message = messageMap[err.message] ?? (status === 500 ? 'Erro interno do servidor' : err.message);

    res.status(status).json({ success: false, message });
};
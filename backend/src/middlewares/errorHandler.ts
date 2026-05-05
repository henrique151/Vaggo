import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const BUSINESS_ERRORS: Record<string, number> = {
    INVALID_UPLOAD_FIELD: 400,
    PROPERTY_IMAGE_LIMIT: 400,
    PROPERTY_REQUIRES_AT_LEAST_ONE_IMAGE: 400,
    CEP_NOT_FOUND: 404,
    ADDRESS_NOT_FOUND: 404,
    GEOCODING_FAILED: 502,
    VEHICLE_NOT_YOURS: 403,
    SPOT_TIME_CONFLICT: 409,
    SPOT_PERIOD_CONFLICT: 409,
    VEHICLE_TYPE_NOT_ALLOWED: 422,
    RESERVATION_NOT_FOUND: 404,
    SPOT_IMAGE_REQUIRED: 400,
    SPOT_IMAGE_LIMIT: 400,
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
    SPOT_UNAVAILABLE: 409,
    USER_ALREADY_MEMBER: 409,
    SPOT_ALREADY_EXISTS: 409,
    EXTERNAL_API_FAILURE: 409,
    INVALID_IMAGE_FORMAT: 415,
    PROFILE_IMAGE_REQUIRED: 400,
    SPOT_NOT_APPROVED: 422,
    PROPERTY_CAPACITY_EXCEEDED: 422,
    SPOT_AVAILABILITY_NOT_CONFIGURED: 422,
    RESERVATION_OUTSIDE_AVAILABILITY: 422,
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    logger.error('Erro na requisicao', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if (err?.original?.code === '22003' || err?.parent?.code === '22003') {
        return res.status(400).json({
            success: false,
            message: 'Valor numerico fora do limite permitido para este campo.'
        });
    }

    const status = BUSINESS_ERRORS[err.message] ?? err.status ?? 500;

    const messageMap: Record<string, string> = {
        INVALID_IMAGE_FORMAT: 'Formato de imagem invalido. Use JPEG, PNG ou WEBP.',
        INVALID_UPLOAD_FIELD: 'Campo de upload invalido para esta rota.',
        PROPERTY_IMAGE_LIMIT: 'Limite de imagens excedido.',
        PROPERTY_REQUIRES_AT_LEAST_ONE_IMAGE: 'Envie pelo menos uma imagem da propriedade.',
        SPOT_IMAGE_REQUIRED: 'Envie ao menos uma imagem para cada vaga gerada.',
        PROFILE_IMAGE_REQUIRED: 'Avatar é obrigatório.',
        SPOT_IMAGE_LIMIT: 'Envie no maximo uma imagem para atualizar a vaga.',
        CEP_NOT_FOUND: 'CEP nao encontrado.',
        INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
        FORBIDDEN: 'Sem permissao para realizar esta acao.',
        MAX_VEHICLES_REACHED: 'Voce atingiu o limite maximo de 3 veiculos por conta.',
        PROPERTY_ACCESS_DENIED: 'Voce nao tem vinculo com a propriedade.',
        USER_NOT_FOUND: 'Usuario nao encontrado.',
        STATE_NOT_FOUND: 'Estado nao encontrado.',
        CITY_NOT_FOUND: 'Cidade nao encontrada.',
        PROPERTY_NOT_FOUND: 'Propriedade nao encontrada.',
        SPOT_NOT_FOUND: 'Vaga nao encontrada.',
        CPF_ALREADY_EXISTS: 'CPF ja cadastrado.',
        EMAIL_ALREADY_EXISTS: 'E-mail ja cadastrado.',
        STATE_ALREADY_EXISTS: 'Estado ja cadastrado.',
        LICENSE_PLATE_ALREADY_EXISTS: 'Ja existe um veiculo cadastrado com esta placa.',
        VEHICLE_NOT_FOUND: 'Veiculo nao encontrado.',
        USER_ALREADY_MEMBER: 'Usuario ja vinculado a propriedade.',
        SPOT_ALREADY_EXISTS: 'Vaga duplicada na mesma propriedade.',
        EXTERNAL_API_FAILURE: 'Erro ao consultar CEP.',
        SPOT_NOT_APPROVED: 'A vaga precisa estar aprovada para liberar reservas.',
        PROPERTY_CAPACITY_EXCEEDED: 'Numero de vagas excede a capacidade da propriedade.',
        SPOT_UNAVAILABLE: 'Vaga nao esta disponivel.',
        ADDRESS_NOT_FOUND: 'Endereco nao encontrado.',
        GEOCODING_FAILED: 'Falha ao processar endereco. Tente novamente.',
        VEHICLE_NOT_YOURS: 'Este veiculo nao pertence a voce.',
        SPOT_TIME_CONFLICT: 'Ja existe uma reserva neste horario.',
        SPOT_PERIOD_CONFLICT: 'Ja existe uma reserva neste periodo.',
        VEHICLE_TYPE_NOT_ALLOWED: 'Tipo de veiculo nao permitido nesta vaga.',
        RESERVATION_NOT_FOUND: 'Reserva nao encontrada.',
        SPOT_AVAILABILITY_NOT_CONFIGURED: 'A vaga nao possui disponibilidade configurada.',
        RESERVATION_OUTSIDE_AVAILABILITY: 'O periodo solicitado esta fora da disponibilidade da vaga.',
    };

    const message = messageMap[err.message] ?? (status === 500 ? 'Erro interno do servidor' : err.message);

    res.status(status).json({ success: false, message });
};

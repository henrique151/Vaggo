import winston from "winston";

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Salva os logs em formato JSON (ótimo para a nuvem)
    ),
    transports: [
        new winston.transports.Console() // No futuro, você pode adicionar um transporte para salvar em arquivo
    ]
}

)
import rateLimit from 'express-rate-limit';

// Global — todas as rotas
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,  
    legacyHeaders: false,
    message: { success: false, message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

// Upload — mais restritivo
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20,                   // 20 uploads por hora por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Limite de uploads atingido. Tente novamente em 1 hora.' },
});

// Auth — proteção contra brute force
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});
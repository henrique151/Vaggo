import { z } from 'zod';

const RULES = {
    COUNT_MIN: 1,
    PREFIX_MAX: 10,
    IDENTIFIER_MAX: 70,
    SIZE_MAX: 999.99,
    PRICE_MAX: 999999.99
} as const;

const parseNumberInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return value;
    }

    const parsed = Number(trimmed.replace(',', '.'));
    return Number.isNaN(parsed) ? value : parsed;
};

const parseBooleanInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1') {
        return true;
    }

    if (normalized === 'false' || normalized === '0') {
        return false;
    }

    return value;
};

const parseJsonInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return value;
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        return value;
    }
};

const parseAllowedVehiclesInput = (value: unknown) => {
    const parsedValue = parseJsonInput(value);

    if (typeof parsedValue !== 'string') {
        return parsedValue;
    }

    const normalized = parsedValue.trim();
    if (!normalized) {
        return value;
    }

    if (normalized.includes(',')) {
        return normalized
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [normalized];
};

const allowedVehiclesSchema = z.preprocess(
    parseAllowedVehiclesInput,
    z.array(
        z.enum(['CARRO', 'MOTO'], {
            error: 'Tipo de veiculo invalido. Use: CARRO ou MOTO, ou ambos'
        })
    ).min(1, 'A vaga deve permitir pelo menos um tipo de veiculo')
);

const hoursSchema = z.preprocess(
    parseJsonInput,
    z.record(
        z.string(),
        z.object({
            start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora inicial invalida (HH:MM)'),
            end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Hora final invalida (HH:MM)')
        })
    ).optional()
);

const countSchema = z
    .preprocess(
        parseNumberInput,
        z
            .number({ message: 'A quantidade deve ser um numero' })
            .int()
            .min(RULES.COUNT_MIN, { message: `E necessario gerar ao menos ${RULES.COUNT_MIN} vaga` })
    );

const sizeSchema = z
    .preprocess(
        parseNumberInput,
        z
            .number({ error: 'O tamanho deve ser um numero' })
            .positive('O tamanho da vaga deve ser maior que zero')
            .max(RULES.SIZE_MAX, `O tamanho da vaga nao pode ser maior que ${RULES.SIZE_MAX}`)
            .optional()
            .default(12.5)
    );

const priceSchema = z
    .preprocess(
        parseNumberInput,
        z
            .number({ error: 'O preco deve ser um numero' })
            .nonnegative('O preco da vaga nao pode ser negativo')
            .max(RULES.PRICE_MAX, `O preco da vaga nao pode ser maior que ${RULES.PRICE_MAX}`)
    );

const prefixSchema = z
    .string()
    .max(RULES.PREFIX_MAX, `O prefixo nao pode exceder ${RULES.PREFIX_MAX} caracteres`)
    .optional()
    .default('VAGA-');

export const generateSpotsSchema = z.object({
    count: countSchema.default(1),
    price: priceSchema.optional().default(0),
    size: sizeSchema,
    isCovered: z.preprocess(parseBooleanInput, z.boolean().optional().default(true)),
    prefix: prefixSchema,
    allowedVehicles: allowedVehiclesSchema,
    operatingHours: hoursSchema
}).strict();

export const updateSpotStatusSchema = z.object({
    status: z.enum(['DISPONIVEL', 'INDISPONIVEL', 'OCUPADA'], {
        error: 'Status invalido. Use: DISPONIVEL, INDISPONIVEL ou OCUPADA'
    })
}).strict();

export const evaluateSpotSchema = z.object({
    approvalStatus: z.enum(['APROVADA', 'RECUSADA', 'SUSPENSA'], {
        error: 'Status de aprovacao invalido'
    }),
    rejectionReason: z.string().max(255, 'Motivo muito longo').optional()
}).strict();

export const spotParamsSchema = z.object({
    propId: z.string().regex(/^\d+$/, 'ID da propriedade invalido'),
});

export const spotIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID da vaga invalido'),
});

export const updateSpotSchema = z.object({
    isCovered: z.preprocess(parseBooleanInput, z.boolean().optional()),
    price: priceSchema.optional(),
    size: z.preprocess(
        parseNumberInput,
        z
            .number({ error: 'O tamanho deve ser um numero' })
            .positive('Tamanho deve ser maior que zero')
            .max(RULES.SIZE_MAX, `O tamanho da vaga nao pode ser maior que ${RULES.SIZE_MAX}`)
            .optional()
    ),
    allowedVehicles: allowedVehiclesSchema.optional(),
    operatingHours: hoursSchema.optional(),
    identifier: z.string().max(RULES.IDENTIFIER_MAX).optional(),
}).strict();

export type GenerateSpotsInput = z.infer<typeof generateSpotsSchema>;
export type UpadateSpotInput = z.infer<typeof updateSpotSchema>;

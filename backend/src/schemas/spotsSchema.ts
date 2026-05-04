import { z } from 'zod';

const RULES = {
    COUNT_MIN: 1,
    PREFIX_MAX: 10,
    IDENTIFIER_MAX: 70,
    SIZE_MAX: 999.99,
    PRICE_MAX: 999999.99,
    WEEKDAYS_MIN: 1,
    WEEKDAYS_MAX: 127,
} as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NORMALIZED_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
const FLEXIBLE_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

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

const parseNullableDateInput = (value: unknown) => {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }

    return value;
};

const normalizeTimeInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return value;
    }

    const match = trimmed.match(FLEXIBLE_TIME_PATTERN);
    if (!match) {
        return value;
    }

    return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
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

const nullableDateSchema = (label: string) => z.preprocess(
    parseNullableDateInput,
    z.union([
        z.string().regex(DATE_PATTERN, `${label} invalida (YYYY-MM-DD)`),
        z.null()
    ])
);

const timeSchema = (label: string) => z.preprocess(
    normalizeTimeInput,
    z.string().regex(NORMALIZED_TIME_PATTERN, `${label} invalida (HH:MM ou HH:MM:SS)`)
);

const allowedVehiclesSchema = z.preprocess(
    parseAllowedVehiclesInput,
    z.array(
        z.enum(['CARRO', 'MOTO'], {
            error: 'Tipo de veiculo invalido. Use: CARRO ou MOTO, ou ambos'
        })
    ).min(1, 'A vaga deve permitir pelo menos um tipo de veiculo')
);

const availabilityFields = {
    startDate: nullableDateSchema('Data inicial').optional().default(null),
    endDate: nullableDateSchema('Data final').optional().default(null),
    weekdays: z.preprocess(
        parseNumberInput,
        z
            .number({ error: 'Os dias da disponibilidade devem ser um numero' })
            .int('Os dias da disponibilidade devem ser um numero inteiro')
            .min(RULES.WEEKDAYS_MIN, `A disponibilidade deve ter valor entre ${RULES.WEEKDAYS_MIN} e ${RULES.WEEKDAYS_MAX}`)
            .max(RULES.WEEKDAYS_MAX, `A disponibilidade deve ter valor entre ${RULES.WEEKDAYS_MIN} e ${RULES.WEEKDAYS_MAX}`)
    ).default(127),
    startTime: timeSchema('Hora inicial da disponibilidade').optional().default('00:00:00'),
    endTime: timeSchema('Hora final da disponibilidade').optional().default('23:59:59'),
};

const spotAvailabilityObjectSchema = z.object(availabilityFields).superRefine((data, ctx) => {
    if (data.startTime >= data.endTime) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endTime'],
            message: 'A hora final da disponibilidade deve ser posterior a inicial'
        });
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endDate'],
            message: 'A data final da disponibilidade deve ser igual ou posterior a inicial'
        });
    }
});

const spotAvailabilityPatchObjectSchema = z.object({
    startDate: nullableDateSchema('Data inicial').optional(),
    endDate: nullableDateSchema('Data final').optional(),
    weekdays: z.preprocess(
        parseNumberInput,
        z
            .number({ error: 'Os dias da disponibilidade devem ser um numero' })
            .int('Os dias da disponibilidade devem ser um numero inteiro')
            .min(RULES.WEEKDAYS_MIN, `A disponibilidade deve ter valor entre ${RULES.WEEKDAYS_MIN} e ${RULES.WEEKDAYS_MAX}`)
            .max(RULES.WEEKDAYS_MAX, `A disponibilidade deve ter valor entre ${RULES.WEEKDAYS_MIN} e ${RULES.WEEKDAYS_MAX}`)
    ).optional(),
    startTime: timeSchema('Hora inicial da disponibilidade').optional(),
    endTime: timeSchema('Hora final da disponibilidade').optional(),
}).superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endTime'],
            message: 'A hora final da disponibilidade deve ser posterior a inicial'
        });
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endDate'],
            message: 'A data final da disponibilidade deve ser igual ou posterior a inicial'
        });
    }
});

export const spotAvailabilitySchema = z.preprocess(parseJsonInput, spotAvailabilityObjectSchema);
export const spotAvailabilityPatchSchema = z.preprocess(parseJsonInput, spotAvailabilityPatchObjectSchema);
export const DEFAULT_SPOT_AVAILABILITY = spotAvailabilityObjectSchema.parse({});

const countSchema = z.preprocess(
    parseNumberInput,
    z
        .number({ message: 'A quantidade deve ser um numero' })
        .int()
        .min(RULES.COUNT_MIN, { message: `E necessario gerar ao menos ${RULES.COUNT_MIN} vaga` })
);

const sizeSchema = z.preprocess(
    parseNumberInput,
    z
        .number({ error: 'O tamanho deve ser um numero' })
        .positive('O tamanho da vaga deve ser maior que zero')
        .max(RULES.SIZE_MAX, `O tamanho da vaga nao pode ser maior que ${RULES.SIZE_MAX}`)
        .optional()
        .default(12.5)
);

const priceSchema = z.preprocess(
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
    availability: spotAvailabilitySchema.optional().default(DEFAULT_SPOT_AVAILABILITY)
}).strict();

export const updateSpotStatusSchema = z.object({
    status: z.enum(['DISPONIVEL', 'INDISPONIVEL', 'OCUPADA'], {
        error: 'Status invalido. Use: DISPONIVEL, INDISPONIVEL ou OCUPADA'
    })
}).strict();

export const evaluateSpotSchema = z.object({
    approvalStatus: z.enum(['APROVADA', 'RECUSADA'], {
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
    availability: spotAvailabilityPatchSchema.optional(),
    identifier: z.string().max(RULES.IDENTIFIER_MAX).optional(),
}).strict();

export type SpotAvailabilityInput = z.infer<typeof spotAvailabilityObjectSchema>;
export type SpotAvailabilityPatchInput = z.infer<typeof spotAvailabilityPatchObjectSchema>;
export type GenerateSpotsInput = z.infer<typeof generateSpotsSchema>;
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>;
export type UpadateSpotInput = UpdateSpotInput;

import { z } from 'zod';

const RULES = {
    COUNT_MIN: 1,
    SIZE_MIN: 1,
    PREFIX_MAX: 10,
    IDENTIFIER_MAX: 70
} as const;

const countSchema = z
    .number({ error: 'A quantidade de vagas é obrigatória e deve ser um número' })
    .int()
    .min(RULES.COUNT_MIN, `É necessário gerar ao menos ${RULES.COUNT_MIN} vaga`);

const sizeSchema = z
    .number({ error: 'O tamanho deve ser um número' })
    .positive('O tamanho da vaga deve ser maior que zero')
    .optional()
    .default(12.5);

const prefixSchema = z
    .string()
    .max(RULES.PREFIX_MAX, `O prefixo não pode exceder ${RULES.PREFIX_MAX} caracteres`)
    .optional()
    .default('VAGA-');

export const spotParamsSchema = z.object({
    propId: z.string().regex(/^\d+$/, 'ID da propriedade inválido'),
}).partial();

export const spotIdParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID da vaga inválido'),
});

export const generateSpotsSchema = z.object({
    count: countSchema,
    size: sizeSchema,
    isCovered: z.boolean().optional().default(true),
    prefix: prefixSchema
}).strict();

export const updateSpotStatusSchema = z.object({
    status: z.enum(['DISPONIVEL', 'INDISPONIVEL', 'OCUPADA'], {
        error: 'Status inválido. Use: DISPONIVEL, INDISPONIVEL ou OCUPADA'
    })
}).strict();

export type GenerateSpotsInput = z.infer<typeof generateSpotsSchema>;
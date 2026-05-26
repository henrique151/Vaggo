import { z } from 'zod';

const parseNumberInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const parsed = Number(value.trim());
    return Number.isNaN(parsed) ? value : parsed;
};

const ratingSchema = z.preprocess(
    parseNumberInput,
    z
        .number({ error: 'A nota deve ser um numero' })
        .int('A nota deve ser um numero inteiro')
        .min(1, 'A nota minima e 1')
        .max(5, 'A nota maxima e 5')
);

export const createReviewSchema = z.object({
    reservationId: z.preprocess(
        parseNumberInput,
        z.number({ error: 'ID da reserva deve ser um numero' }).int().positive()
    ),
    rating: ratingSchema,
    comment: z.string().trim().max(500).optional().default('')
}).strict();

export const updateReviewSchema = z.object({
    rating: ratingSchema.optional(),
    comment: z.string().trim().max(500).optional()
}).strict().refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: 'Informe nota ou comentario para atualizar'
});

export const getReviewsFilterSchema = z.object({
    propertyId: z.preprocess(parseNumberInput, z.number().int().positive().optional()),
    spotId: z.preprocess(parseNumberInput, z.number().int().positive().optional()),
    reviewerId: z.preprocess(parseNumberInput, z.number().int().positive().optional()),
    minRating: z.preprocess(parseNumberInput, z.number().int().min(1).max(5).optional()),
    maxRating: z.preprocess(parseNumberInput, z.number().int().min(1).max(5).optional())
}).strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsFilterInput = z.infer<typeof getReviewsFilterSchema>;

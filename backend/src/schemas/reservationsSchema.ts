import { z } from 'zod';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const createSchema = z.object({
    spotId: z.coerce.number().int().positive(),
    vehicleId: z.coerce.number().int().positive(),
    startDate: z.string().regex(DATE_PATTERN, 'Data inicial invalida (YYYY-MM-DD)'),
    endDate: z.string().regex(DATE_PATTERN, 'Data final invalida (YYYY-MM-DD)'),
}).refine((data) => data.startDate <= data.endDate, {
    message: 'Data inicial deve ser anterior ou igual a data final',
    path: ['endDate'],
});

export type CreateReservationInput = z.infer<typeof createSchema> & {
    userId: number;
};

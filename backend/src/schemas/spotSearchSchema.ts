import z from 'zod';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeCepInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const digits = value.replace(/\D/g, '');
    return digits || undefined;
};

export const searchByAddressSchema = z.object({
    address: z.string().min(3, 'Endereco muito curto').trim().optional(),
    cep: z.preprocess(
        normalizeCepInput,
        z.string().length(8, 'CEP invalido').optional()
    ),
    lat: z.coerce.number().gte(-90, 'Latitude invalida').lte(90, 'Latitude invalida').optional(),
    lng: z.coerce.number().gte(-180, 'Longitude invalida').lte(180, 'Longitude invalida').optional(),
    startDate: z.string().regex(DATE_PATTERN, 'Data inicial invalida (YYYY-MM-DD)').optional(),
    endDate: z.string().regex(DATE_PATTERN, 'Data final invalida (YYYY-MM-DD)').optional(),
    radius: z.coerce.number().positive().max(50).optional().default(10),
}).refine((data) => {
    const hasCoordinates = data.lat !== undefined || data.lng !== undefined;

    if (!hasCoordinates) {
        return true;
    }

    return data.lat !== undefined && data.lng !== undefined;
}, {
    message: 'Informe lat e lng juntos para buscar por coordenadas',
    path: ['lat'],
}).refine((data) => Boolean(data.address || data.cep || (data.lat !== undefined && data.lng !== undefined)), {
    message: 'Informe um endereco, um CEP ou coordenadas para a busca',
    path: ['address'],
}).refine((data) => {
    if (!data.startDate && !data.endDate) {
        return true;
    }

    return Boolean(data.startDate && data.endDate);
}, {
    message: 'Informe startDate e endDate juntos para filtrar por periodo',
    path: ['startDate'],
}).refine((data) => {
    if (!data.startDate || !data.endDate) {
        return true;
    }

    return data.startDate <= data.endDate;
}, {
    message: 'Data inicial deve ser anterior ou igual a data final',
    path: ['endDate'],
});

export type SearchByAddressInput = z.infer<typeof searchByAddressSchema>;

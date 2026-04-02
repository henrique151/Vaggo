import { z } from "zod";

const RULES = {
    BRAND_MAX: 30,
    MODEL_MAX: 25,
    COLOR_MAX: 30,
    LICENSEPLATE_MAX: 10,
} as const;

const plateRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;

const brandSchema = z.string()
    .min(2, 'A marca deve ter pelo menos 2 caracteres')
    .max(RULES.BRAND_MAX, `A marca não pode exceder ${RULES.BRAND_MAX} caracteres`)
    .trim();

const modelSchema = z.string()
    .min(2, 'O modelo deve ter pelo menos 2 caracteres')
    .max(RULES.MODEL_MAX, `O modelo não pode exceder ${RULES.MODEL_MAX} caracteres`)
    .trim();

const colorSchema = z.string()
    .min(3, 'A cor deve ter pelo menos 3 caracteres')
    .max(RULES.COLOR_MAX, `A cor não pode exceder ${RULES.COLOR_MAX} caracteres`)
    .trim();

const licensePlateSchema = z.string()
    .max(RULES.LICENSEPLATE_MAX, `A placa não pode exceder ${RULES.LICENSEPLATE_MAX} caracteres`)
    .regex(plateRegex, 'Formato de placa inválido (use ABC1234 ou ABC1D23)')
    .toUpperCase();

const manufactureYearSchema = z.string()
    .regex(/^\d{4}$/, 'O ano de fabricação deve ter 4 dígitos (ex: 2022)')
    .refine((year) => {
        const y = Number(year);
        const current = new Date().getFullYear();
        return y >= 1950 && y <= current;
    }, `Ano de fabricação inválido`);

const typeSchema = z.enum(['CARRO', 'MOTO'], {
    error: 'Tipo de veículo deve ser CARRO ou MOTO',
});

const sizeSchema = z.enum(['PEQUENO', 'MEDIO', 'GRANDE'], {
    error: 'Tamanho do carro deve ser PEQUENO, MEDIO ou GRANDE',
});


const vehicleBaseSchema = z
    .object({
        brand: brandSchema,
        model: modelSchema,
        color: colorSchema,
        licensePlate: licensePlateSchema,
        manufactureYear: manufactureYearSchema,
        type: typeSchema,
        size: sizeSchema.optional(),
    })
    .strict();

export const createVehicleSchema = vehicleBaseSchema
    .superRefine((data, ctx) => {
        if (data.type === 'CARRO' && !data.size) {
            ctx.addIssue({
                path: ['size'],
                code: z.ZodIssueCode.custom,
                message: 'Tamanho é obrigatório para carros (PEQUENO, MEDIO ou GRANDE)',
            });
        }
    })
    .transform((data) => ({
        ...data,
        size: data.type === 'MOTO' ? 'PEQUENO' as const : data.size!,
    }));


export const updateVehicleSchema = vehicleBaseSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
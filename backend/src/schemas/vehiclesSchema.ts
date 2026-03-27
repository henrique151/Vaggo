import z from "zod";

const RULES = {
    BRAND_MAX: 30,
    MODEL_MAX: 25,
    COLOR_MAX: 30,
    LICENSEPLATE_MAX: 10,
} as const

const plateRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const brandSchema = z.string()
    .min(2, "A marca deve ter pelo menos 2 caracteres")
    .max(RULES.BRAND_MAX, `A marca não pode exceder ${RULES.BRAND_MAX} caracteres`)

const modelSchema = z.string()
    .min(2, "O modelo deve ter pelo menos 2 caracteres")
    .max(RULES.MODEL_MAX, `A marca não pode exceder ${RULES.MODEL_MAX} caracteres`)

const colorSchema = z.string()
    .min(3, "A cor deve ter pelo menos 3 caracteres")
    .max(RULES.COLOR_MAX, `A cor não pode exceder ${RULES.COLOR_MAX} caracteres`)

const licensePlateSchema = z.string()
    .max(RULES.LICENSEPLATE_MAX, `A placa não pode exceder ${RULES.LICENSEPLATE_MAX} caracteres`)
    .regex(plateRegex, "Formato de placa inválido (Use ABC1234 ou ABC1D23)")

const manufactureYearSchema = z.string()
    .regex(dateRegex, "A data de fabricação deve estar no formato YYYY-MM-DD")

export const createVehicleSchema = z
    .object({
        brand: brandSchema,
        model: modelSchema,
        color: colorSchema,
        licensePlate: licensePlateSchema,
        manufactureYear: manufactureYearSchema,
        isActive: z.boolean().default(true).optional(),

    })
    .strict()

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

import { z } from 'zod';

const RULES = {
    NAME_MIN: 3,
    NAME_MAX: 70,
    DESC_MAX: 100,
    ZIP_LENGTH: 8,
    NUMBER_MAX: 20,
    CAPACITY_MIN: 1
} as const;

const propertyNameSchema = z
    .string({ error: 'Nome da propriedade é obrigatório' })
    .min(RULES.NAME_MIN, `Nome deve ter no mínimo ${RULES.NAME_MIN} caracteres`)
    .max(RULES.NAME_MAX, `Nome não pode exceder ${RULES.NAME_MAX} caracteres`)
    .trim();

const propertyTypeSchema = z.string({ error: 'Tipo é obrigatório' });

const descriptionSchema = z
    .string()
    .max(RULES.DESC_MAX, `Descrição não pode exceder ${RULES.DESC_MAX} caracteres`)
    .trim()
    .optional();

const capacitySchema = z
    .coerce.number({
        error: 'Capacidade deve ser um número'
    })
    .int()
    .min(RULES.CAPACITY_MIN, `Capacidade mínima é de ${RULES.CAPACITY_MIN} vaga`);

const zipCodeSchema = z
    .string({ error: 'CEP é obrigatório' })
    .length(RULES.ZIP_LENGTH, `CEP deve ter exatamente ${RULES.ZIP_LENGTH} dígitos`)
    .regex(/^\d+$/, 'CEP deve conter apenas números');

const addressStringSchema = (label: string, max: number) => z
    .string()
    .min(2, `${label} muito curto`)
    .max(max, `${label} muito longo`)
    .trim()
    .optional();

export const createPropertySchema = z.object({
    name: propertyNameSchema,
    type: propertyTypeSchema,
    description: descriptionSchema,
    totalCapacity: capacitySchema,
    isActive: z.boolean().optional().default(true),


    street: addressStringSchema('Rua', 70),
    number: z.string({ error: 'Número é obrigatório' }).max(20).trim(),
    complement: z.string().max(100, 'Complemento muito longo').trim().optional(),
    neighborhood: addressStringSchema('Bairro', 70),
    zipCode: zipCodeSchema,

    cityId: z.number().positive().optional()
}).strict();

export const updatePropertySchema = createPropertySchema.extend({
    imagesToRemove: z.union([z.string(), z.array(z.string())]).optional()
}).strict();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

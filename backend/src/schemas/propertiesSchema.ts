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
    .trim();

const capacitySchema = z
    .number({ error: 'Capacidade deve ser um número' })
    .int()
    .min(RULES.CAPACITY_MIN, `Capacidade mínima é de ${RULES.CAPACITY_MIN} vaga`);

const zipCodeSchema = z
    .string({ error: 'CEP é obrigatório' })
    .length(RULES.ZIP_LENGTH, `CEP deve ter exatamente ${RULES.ZIP_LENGTH} dígitos`)
    .regex(/^\d+$/, 'CEP deve conter apenas números');

const addressStringSchema = (label: string, max: number) => z
    .string({ error: `${label} é obrigatório` })
    .min(2, `${label} muito curto`)
    .max(max, `${label} muito longo`)
    .trim();

export const createPropertySchema = z.object({
    // Dados da Propriedade
    name: propertyNameSchema,
    type: propertyTypeSchema,
    description: descriptionSchema,
    totalCapacity: capacitySchema,
    isActive: z.boolean().optional().default(true),

    // Dados do Endereço
    street: addressStringSchema('Rua', 70),
    number: addressStringSchema('Número', 20),
    neighborhood: addressStringSchema('Bairro', 70),
    zipCode: zipCodeSchema,
    cityId: z.number({ error: 'ID da cidade é obrigatório' }).positive()
}).strict();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
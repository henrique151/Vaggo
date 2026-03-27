import { z } from 'zod';

const RULES = {
    NAME_MIN: 3,
    NAME_MAX: 100,
    CPF_LENGTH: 11,
    EMAIL_MAX: 255,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
    PHONE_MIN: 10,
    PHONE_MAX: 15,
} as const;

const nameSchema = z
    .string({ error: 'Nome é obrigatório' })
    .min(RULES.NAME_MIN, `Nome deve ter no mínimo ${RULES.NAME_MIN} caracteres`)
    .max(RULES.NAME_MAX, `Nome não pode exceder ${RULES.NAME_MAX} caracteres`)
    .regex(
        /^[a-zA-ZáàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ\s'-]+$/,
        'Nome contém caracteres inválidos'
    )
    .trim();

const cpfSchema = z
    .string({ error: 'CPF é obrigatório' })
    .length(RULES.CPF_LENGTH, `CPF deve ter exatamente ${RULES.CPF_LENGTH} dígitos`)
    .regex(/^\d+$/, 'CPF deve conter apenas números');

const emailSchema = z
    .string({ error: 'E-mail é obrigatório' })
    .email('E-mail inválido')
    .max(RULES.EMAIL_MAX, 'E-mail muito longo')
    .toLowerCase()
    .trim();

const passwordSchema = z
    .string({ error: 'Senha é obrigatória' })
    .min(RULES.PASSWORD_MIN, `Senha deve ter no mínimo ${RULES.PASSWORD_MIN} caracteres`)
    .max(RULES.PASSWORD_MAX, `Senha não pode exceder ${RULES.PASSWORD_MAX} caracteres`)
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.\/?]/, 'Senha deve conter pelo menos um caractere especial');

const phoneSchema = z
    .string({ error: 'Telefone é obrigatório' })
    .min(RULES.PHONE_MIN, `Telefone deve ter no mínimo ${RULES.PHONE_MIN} dígitos`)
    .max(RULES.PHONE_MAX, `Telefone não pode exceder ${RULES.PHONE_MAX} caracteres`)
    .regex(/^[\d+\-\s()]*$/, 'Telefone contém caracteres inválidos');

const birthDateSchema = z
    .string({ error: 'Data de nascimento é obrigatória' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine((date) => {
        const birth = new Date(date);
        const age = new Date().getFullYear() - birth.getFullYear();
        return age >= 18 && age <= 150;
    }, 'Usuário deve ter entre 18 e 150 anos')
    .transform((date) => new Date(date));

const genderSchema = z.enum(['M', 'F', 'O'], {
    error: 'Gênero deve ser M, F ou O',
});


export const createUserSchema = z
    .object({
        name: nameSchema,
        cpf: cpfSchema,
        gender: genderSchema,
        phone: phoneSchema,
        birthDate: birthDateSchema,
        email: emailSchema,
        password: passwordSchema,
        permissionLevel: z.enum(['1', '2', '3']).optional().default('1'),
    })
    .strict();

export const updateUserSchema = createUserSchema
    .omit({ cpf: true })   // CPF não deve ser alterado
    .partial();

export const loginUserSchema = z
    .object({
        email: emailSchema,
        password: z.string({ error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
    })
    .strict();


export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
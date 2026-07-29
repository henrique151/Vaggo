import { z } from 'zod';

const RULES = {
    EMAIL_MAX: 255,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
    IDENTIFIER_MIN: 5,
    IDENTIFIER_MAX: 255,
    OTP_LENGTH: 6,
    RESET_TOKEN_MIN: 32,
} as const;

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

const codeSchema = z
    .string({ error: 'Código é obrigatório' })
    .length(RULES.OTP_LENGTH, `Código deve ter ${RULES.OTP_LENGTH} dígitos`)
    .regex(/^\d+$/, 'Código deve conter apenas números');

const identifierSchema = z
    .string({ error: 'E-mail ou telefone é obrigatório' })
    .min(RULES.IDENTIFIER_MIN, 'Informe um e-mail ou telefone válido')
    .max(RULES.IDENTIFIER_MAX, 'Identificador muito longo')
    .trim();

export const loginSchema = z
    .object({
        email: emailSchema,
        password: z.string({ error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
    })
    .strict();

export const forgotPasswordSchema = z
    .object({
        email: emailSchema,
    })
    .strict();

export const resendRegistrationSchema = z
    .object({
        identifier: identifierSchema,
    })
    .strict();

export const resetForgotPasswordSchema = z
    .object({
        resetToken: z
            .string({ error: 'Token de recuperação é obrigatório' })
            .min(RULES.RESET_TOKEN_MIN, 'Token de recuperação inválido')
            .trim(),
        newPassword: passwordSchema,
        confirmPassword: z.string({ error: 'Confirmação de senha é obrigatória' }),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Confirmação de senha não confere',
    });

export const confirmRegistrationSchema = z
    .object({
        email: emailSchema,
        code: codeSchema,
    })
    .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResendRegistrationInput = z.infer<typeof resendRegistrationSchema>;
export type ResetForgotPasswordInput = z.infer<typeof resetForgotPasswordSchema>;
export type ConfirmRegistrationInput = z.infer<typeof confirmRegistrationSchema>;

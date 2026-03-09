import { z } from 'zod';

export const createUserSchema = z.object({
    username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    firstName: z.string().min(1, 'Nome é obrigatório'),
    lastName: z.string().min(1, 'Sobrenome é obrigatório'),
    age: z.number().positive('Idade deve ser positiva'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export const loginUserSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
});

// Schemas de validação usando Zod para dados de usuário.
// createUserSchema: valida os dados necessários para criar um novo usuário
// (username, email, nome, sobrenome, idade e senha).
// loginUserSchema: valida os dados enviados no login (email e senha).
// Esses schemas garantem que os dados recebidos pela API estejam no formato
// correto antes de serem processados pela aplicação.
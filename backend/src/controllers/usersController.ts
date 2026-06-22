import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserService } from '../services/UserService';
import { CreateUserInput, searchUsersSchema } from '../schemas/usersSchema';

/**
 * Criação de Usuário
 * Permite criar uma conta nova na plataforma. Rota pública.
 */

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, cpf, gender, phone, birthDate, email, password, permissionLevel } = req.body as CreateUserInput;
    const personData = { name, cpf, gender, phone, birthDate };
    const userData = { email, password, permissionLevel };
    const fileData = req.file ? { buffer: req.file.buffer, mimetype: req.file.mimetype } : undefined;
    const data = await UserService.createAccount(personData, userData, fileData);

    res.status(201).json({
        success: true,
        message: 'Usuário criado. Confirme o código enviado por e-mail.',
        data,
    });
});

/**
 * Deleção de Usuário
 * Apenas ADMIN pode deletar a conta de um usuário.
 */

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await UserService.deleteAccount(id);
    res.status(200).json({ success: true, message: 'Usuário removido' });
});

/**
 * Listagem de Usuários
 * MANAGER e ADMIN podem visualizar a lista de usuários.
 */

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    const data = await UserService.getAllUsers();
    res.status(200).json({ success: true, data });
});

/**
 * Detalhes do Usuário
 * O próprio USER pode ver seus dados, assim como MANAGER e ADMIN.
 */

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await UserService.getUserById(id);
    res.status(200).json({ success: true, data });
});

/**
 * Atualização do Usuário
 * USER atualiza próprios dados, ADMIN pode atualizar de qualquer um.
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const fileData = req.file ? { buffer: req.file.buffer, mimetype: req.file.mimetype } : undefined;
    const data = await UserService.updateAccount(id, req.body, fileData);
    res.status(200).json({ success: true, message: 'Atualizado com sucesso', data });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const filterResult = searchUsersSchema.safeParse(req.query);

    if (!filterResult.success) {
        return res.status(400).json({ success: false, message: 'Filtros de usuario invalidos' });
    }

    const data = await UserService.searchUsers(filterResult.data);
    res.status(200).json({ success: true, total: data.length, data });
});

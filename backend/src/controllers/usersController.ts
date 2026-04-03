import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserService } from '../services/UserService';
import { CreateUserInput } from '../schemas/usersSchema';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, cpf, gender, phone, birthDate, email, password, permissionLevel } =
        req.body as CreateUserInput;
    const personData = { name, cpf, gender, phone, birthDate };
    const userData = { email, password, permissionLevel };
    const data = await UserService.createAccount(personData, userData);
    res.status(201).json({ success: true, message: 'Usuário criado com sucesso', data });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await UserService.deleteAccount(id);
    res.status(200).json({ success: true, message: 'Usuário removido' });
});
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const data = await UserService.getAllUsers();
    res.status(200).json({ success: true, data });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await UserService.getUserById(id);
    res.status(200).json({ success: true, data });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authReq = req as AuthRequest;
    if (Number(authReq.user?.id) !== id) {
        return res.status(403).json({ success: false, message: 'Sem permissão' });
    }
    const data = await UserService.updateAccount(id, req.body);
    res.status(200).json({ success: true, message: 'Atualizado com sucesso', data });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const data = await UserService.authenticate(email, password);
    res.status(200).json({ success: true, message: 'Login realizado com sucesso', data });
});

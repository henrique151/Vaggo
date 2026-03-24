import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserService } from '../services/UserService';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const {
        name, cpf, gender, phone, birthDate, // <- Person Data
        email, password, type, permissionLevel // <- User Data
    } = req.body;

    const personData = { name, cpf, gender, phone, birthDate };
    const userData = { email, password, type, permissionLevel };

    const createdUser = await UserService.createAccount(personData, userData);

    res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: createdUser
    });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.status(200).json({ success: true, message: `Usuário removido` });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.findAll();
    // { attributes: { exclude: ['password'] } }
    res.status(200).json({ success: true, data: users });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const user = await User.findByPk(id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authReq = req as AuthRequest;

    if (Number(authReq.user?.id) !== id) {
        return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    try {
        const updatedUser = await UserService.updateAccount(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Atualizado com sucesso',
            data: updatedUser
        });
    } catch (error: any) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        throw error;
    }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const expiresIn = 3600;
    const secret = process.env.JWT_SECRET || 'super-segredo';
    const token = jwt.sign({ id: user.id }, secret, { expiresIn })

    res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        token: token,
        expiresIn: expiresIn
    })
});

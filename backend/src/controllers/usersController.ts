import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { password, ...rest } = req.body;

    const saltRounds = 10
    const hashedPaword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ ...rest, password: hashedPaword });

    const userRepponse = user.toJSON();

    res.status(201).json({ success: true, message: 'Usuário criado', data: userRepponse })
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
    const { password, ...updateData } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const authReq = req as AuthRequest;

    if (Number(authReq.user?.id) !== id) {
        return res.status(403).json({
            success: false,
            message: 'Você não tem permissão para editar este usuário'
        });
    }

    if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Retorna o usuário atualizado (recomendo excluir a senha aqui também)
    const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });

    res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
    });
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

    // Gerando o Token JWT
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

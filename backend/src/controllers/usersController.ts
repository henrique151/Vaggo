import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from 'zod';

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
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data: users });
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
    const expiresIn = 3600; // 1 horas.
    const secret = process.env.JWT_SECRET || 'super-segredo';
    const token = jwt.sign({ id: user.id }, secret, { expiresIn })

    res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        token: token,
        expiresIn: expiresIn
    })
});
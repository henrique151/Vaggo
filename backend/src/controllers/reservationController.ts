import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReservationService } from '../services/ReservationService';
import { createSchema } from '../schemas/reservationsSchema';

/**
 * Criar Reserva
 * Qualquer usuário autenticado.
 */
export const createReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = createSchema.parse(req.body);

    const result = await ReservationService.createReservation({ ...data, userId });

    res.status(201).json({
        success: true,
        message: 'Reserva criada com sucesso. Aguardando aprovacao do proprietario.',
        data: result,
    });
});

/**
 * Atualizar Status da Reserva
 * O dono da propriedade ou ADMIN/MANAGER.
 */
export const updateReservationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const action = req.params.action as 'approve' | 'reject' | 'cancel';
    const userId = Number(req.user?.id);

    if (!['approve', 'reject', 'cancel'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Acao invalida' });
    }

    const data = await ReservationService.updateStatus(id, action, userId);

    res.status(200).json({
        success: true,
        message: `Reserva ${action === 'approve' ? 'aprovada' : action === 'reject' ? 'recusada' : 'cancelada'} com sucesso`,
        data,
    });
});

/**
 * Minhas Reservas
 * Retorna as reservas do usuário autenticado.
 */
export const getMyReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReservationService.getMyReservations(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Reservas da Minha Propriedade
 * Retorna as reservas para os spots do usuário dono.
 */
export const getOwnerReservationRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReservationService.getOwnerReservationRequests(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Listar Todas as Reservas
 * MANAGER e ADMIN.
 */
export const getAllReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await ReservationService.getAllReservations();
    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Deletar Reserva
 * Apenas ADMIN ou MANAGER.
 */
export const deleteReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    await ReservationService.deleteReservation(id);
    res.status(200).json({ success: true, message: 'Reserva deletada' });
});

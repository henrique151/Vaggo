import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { VehicleService } from '../services/VehicleService';

/**
 * Cadastrar Veículo
 * Qualquer usuário autenticado pode cadastrar um veículo.
 */
export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const authUserId = Number(req.user?.id);
    const data = await VehicleService.createVehicle(req.body, authUserId);
    res.status(201).json({ success: true, message: 'Veículo cadastrado com sucesso', data });
});

/**
 * Listar Todos os Veículos
 * Apenas MANAGER e ADMIN podem listar todos os veículos do sistema.
 */
export const getAllVehicles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await VehicleService.getAllVehicles();
    res.status(200).json({ success: true, data });
});

/**
 * Listar Meus Veículos
 * Lista apenas os veículos do usuário autenticado.
 */
export const getMyVehicles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const authUserId = Number(req.user?.id);
    const data = await VehicleService.getUserVehicles(authUserId);
    res.status(200).json({ success: true, data });
});

/**
 * Consultar Veículo por ID
 * O dono do veículo pode consultar, assim como MANAGER e ADMIN.
 */
export const getVehicleById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const authUserId = Number(req.user?.id);
    const role = req.user?.role;
    const data = await VehicleService.getVehicleById(id, authUserId, role);
    res.status(200).json({ success: true, data });
});

/**
 * Atualizar Veículo
 * O dono do veículo pode atualizar, assim como o ADMIN.
 */
export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    const role = req.user?.role;
    const data = await VehicleService.updateVehicle(id, req.body, userId, role);
    res.status(200).json({ success: true, message: 'Veículo atualizado com sucesso', data });
});

/**
 * Remover Veículo
 * O dono do veículo pode deletar, assim como o ADMIN.
 */
export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    const role = req.user?.role;
    await VehicleService.deleteVehicle(id, userId, role);
    res.status(200).json({ success: true, message: 'Veículo removido com sucesso' });
});
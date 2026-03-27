import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { VehicleService } from '../services/VehicleService';

export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const authUserId = Number(req.user?.id);
    const data = await VehicleService.createVehicle(req.body, authUserId);
    res.status(201).json({ success: true, message: 'Veículo cadastrado com sucesso', data });
});

export const getAllVehicles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await VehicleService.getAllVehicles();
    res.status(200).json({ success: true, data });
});

export const getVehicleById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await VehicleService.getVehicleById(id);
    res.status(200).json({ success: true, data });
});

export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    const data = await VehicleService.updateVehicle(id, req.body, userId);
    res.status(200).json({ success: true, message: 'Veículo atualizado com sucesso', data });
});

export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    await VehicleService.deleteVehicle(id, userId);
    res.status(200).json({ success: true, message: 'Veículo removido' });
});
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SpotService } from '../services/SpotService';
import { GenerateSpotsInput } from '../schemas/sportsSchema';

export const generateSports = asyncHandler(async (req: Request, res: Response) => {
    const propId = Number(req.params.propId);
    const spotData = req.body as GenerateSpotsInput;
    const data = await SpotService.generateSpots(propId, spotData);
    res.status(201).json({ success: true, message: 'Vagas geradas e aguardando aprovação', data });
});

export const evaluateSpots = asyncHandler(async (req: Request, res: Response) => {
    const spotId = Number(req.params.id);
    const result = await SpotService.evaluateSpot(spotId, req.body.approvalStatus);
    res.status(200).json({ success: true, data: result });
});

export const listByProperty = asyncHandler(async (req: Request, res: Response) => {
    const propId = Number(req.params.propId);
    const data = await SpotService.getByProperty(propId);
    res.status(200).json({ success: true, data });
});

export const updateSpot = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await SpotService.updateSpot(id, req.body);
    res.status(200).json({ success: true, message: 'Status da vaga atualizado', data });
});

export const updateSpotData = asyncHandler(async (req: Request, res: Response) => {
    const spotId = Number(req.params.id);
    const data = await SpotService.updateSpotData(spotId, req.body);
    res.status(200).json({ success: true, message: 'Dados da vaga atualizados', data });
});

export const deleteSpot = asyncHandler(async (req: Request, res: Response) => {
    const spotId = Number(req.params.id);
    const propId = Number(req.params.propId);
    await SpotService.deleteSpot(spotId, propId);
    res.status(200).json({ success: true, message: 'Vaga removida' });
});
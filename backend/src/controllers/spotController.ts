import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SpotService } from '../services/SpotService';
import { GenerateSpotsInput } from '../schemas/sportsSchema';

export const generateSports = asyncHandler(async (req: Request, res: Response) => {
    const propId = Number(req.params.propId);
    const spotData = req.body as GenerateSpotsInput;

    const data = await SpotService.generateSpots(propId, spotData);

    res.status(201).json({
        success: true,
        message: `${spotData.count} vagas geradas com sucesso`,
        data
    });
});

export const listByProperty = asyncHandler(async (req: Request, res: Response) => {
    const propId = Number(req.params.propId);
    const data = await SpotService.getByProperty(propId);
    res.status(200).json({ success: true, data });
});

export const patchStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const data = await SpotService.updateStatusProperty(id, status);
    res.status(200).json({ success: true, message: 'Status da vaga atualizado', data });
});
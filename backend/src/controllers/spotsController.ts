import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { SpotService } from '../services/SpotService';
import { GenerateSpotsInput, getAdminSpotsSchema } from '../schemas/spotsSchema';
import { AuthRequest } from '../middlewares/authMiddleware';

export const generateSpots = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const authUserId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    const propId = Number(req.params.propId);
    const spotData = req.body as GenerateSpotsInput;
    const files = req.files as Express.Multer.File[];
    const data = await SpotService.generateSpots(propId, spotData, authUserId, role, files);
    res.status(201).json({ success: true, message: 'Vagas geradas e aguardando aprovação', data });
});

export const listByProperty = asyncHandler(async (req: Request, res: Response) => {
    const propId = Number(req.params.propId);
    const data = await SpotService.getByProperty(propId);
    res.status(200).json({ success: true, data });
});

export const updateSpot = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const authUserId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    const id = Number(req.params.id);
    const data = await SpotService.updateSpot(id, req.body, authUserId, role);
    res.status(200).json({ success: true, message: 'Status da vaga atualizado', data });
});

export const updateSpotData = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const authUserId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    const spotId = Number(req.params.id);
    const file = req.file ? { buffer: req.file.buffer, mimetype: req.file.mimetype } : undefined;
    const data = await SpotService.updateSpotData(spotId, req.body, authUserId, role, file);
    res.status(200).json({ success: true, message: 'Dados da vaga atualizados', data });
});

export const deleteSpot = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const authUserId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    const spotId = Number(req.params.id);
    const propId = Number(req.params.propId);
    await SpotService.deleteSpot(spotId, propId, authUserId, role);
    res.status(200).json({ success: true, message: 'Vaga removida' });
});

export const getAdminSpots = asyncHandler(async (req: Request, res: Response) => {
    const filterResult = getAdminSpotsSchema.safeParse(req.query);

    if (!filterResult.success) {
        return res.status(400).json({ success: false, message: 'Filtro de status invalido' });
    }

    const data = await SpotService.getAdminSpots(filterResult.data.status);
    res.status(200).json({ success: true, total: data.length, data });
});
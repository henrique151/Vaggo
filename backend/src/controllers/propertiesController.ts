import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PropertyService } from '../services/PropertyService';
import { CreatePropertyInput } from "../schemas/propertiesSchema";
import { AuthRequest } from "../middlewares/authMiddleware";

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = Number(authReq.user?.id);
    const data = req.body as CreatePropertyInput;

    const files = req.files as Express.Multer.File[];
    const fileDataList = files?.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })) || [];

    const result = await PropertyService.createProperty(data, userId, fileDataList);

    res.status(201).json({
        success: true,
        message: 'Propriedade e endereço cadastrados com sucesso',
        data: result
    });
});

export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
    const data = await PropertyService.getAllProperties();
    res.status(200).json({ sucesss: true, data })
})

export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const id = Number(req.params.id);
    const userId = Number(authReq.user?.id);

    const data = await PropertyService.getPropertyById(id, userId);
    res.status(200).json({ success: true, data });
})

export const getMyProperties = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = Number(authReq.user?.id);
    const data = await PropertyService.getMyProperties(userId);
    res.status(200).json({ success: true, data });
});

export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await PropertyService.deleteProperty(id);
    res.status(200).json({ success: true, message: 'Propriedade removida' });
})

export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;

    const files = req.files as Express.Multer.File[];
    const newFiles = files ? files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })) : [];

    const imagesToRemove = Array.isArray(data.imagesToRemove)
        ? data.imagesToRemove
        : data.imagesToRemove
            ? JSON.parse(data.imagesToRemove)
            : undefined;

    const result = await PropertyService.updateProperty(id, data, newFiles, imagesToRemove);

    res.status(200).json({
        success: true,
        message: 'Propriedade e endereço atualizados',
        data: result
    });
})



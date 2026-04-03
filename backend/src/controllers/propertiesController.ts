import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PropertyService } from '../services/PropertyService';
import { CreatePropertyInput } from "../schemas/propertiesSchema";

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreatePropertyInput;
    const result = await PropertyService.createProperty(data);

    res.status(201).json({
        success: true,
        message: 'Propriedade e endereço cadastrados com sucesso',
        data: result
    });
})

export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
    const data = await PropertyService.getAllProperties();
    res.status(200).json({ sucesss: true, data })
})

export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await PropertyService.getPropertyById(id);
    res.status(200).json({ success: true, data });
})

export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await PropertyService.deleteProperty(id);
    res.status(200).json({ success: true, message: 'Propriedade removida' });
})


export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;

    const result = await PropertyService.updateProperty(id, data);

    res.status(200).json({
        success: true,
        message: 'Propriedade e endereço atualizados',
        data: result
    });
})



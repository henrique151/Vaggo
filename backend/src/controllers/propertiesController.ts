import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PropertyService } from '../services/PropertyService';
import { CreatePropertyInput, searchPropertiesSchema } from "../schemas/propertiesSchema";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Criar Propriedade
 * Qualquer usuário autenticado pode criar.
 */

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

/**
 * Listar Todas as Propriedades
 * MANAGER e ADMIN podem listar todas as propriedades do sistema.
 */
export const getAllProperties = asyncHandler(async (req: Request, res: Response) => {
    const data = await PropertyService.getAllProperties();
    res.status(200).json({ sucesss: true, data })
})

/**
 * Consultar Propriedade
 * O dono pode consultar, assim como MANAGER e ADMIN.
 */
export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const id = Number(req.params.id);
    const userId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    const data = await PropertyService.getPropertyById(id, userId, role);
    res.status(200).json({ success: true, data });
})

/**
 * Minhas Propriedades
 * Lista as propriedades do usuário autenticado.
 */
export const getMyProperties = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = Number(authReq.user?.id);
    const data = await PropertyService.getMyProperties(userId);
    res.status(200).json({ success: true, data });
});

/**
 * Deletar Propriedade
 * O dono da propriedade ou um ADMIN pode deletar.
 */
export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const id = Number(req.params.id);
    const userId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    await PropertyService.deleteProperty(id, userId, role);
    res.status(200).json({ success: true, message: 'Propriedade removida' });
})

/**
 * Atualizar Propriedade
 * O dono da propriedade ou um ADMIN pode atualizar.
 */
export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = Number(authReq.user?.id);
    const role = authReq.user?.role;
    const id = Number(req.params.id);
    const data = req.body;
    const files = req.files as Express.Multer.File[];
    const newFiles = files ? files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })) : [];
    const imagesToRemove = Array.isArray(data.imagesToRemove)
        ? data.imagesToRemove
        : data.imagesToRemove
            ? JSON.parse(data.imagesToRemove)
            : undefined;
    const result = await PropertyService.updateProperty(id, data, newFiles, imagesToRemove, userId, role);
    res.status(200).json({
        success: true,
        message: 'Propriedade e endereço atualizados',
        data: result
    });
});

export const searchProperties = asyncHandler(async (req: Request, res: Response) => {
    const filterResult = searchPropertiesSchema.safeParse(req.query);

    if (!filterResult.success) {
        return res.status(400).json({ success: false, message: 'Filtros de propriedade invalidos' });
    }

    const data = await PropertyService.searchProperties(filterResult.data);
    res.status(200).json({ success: true, total: data.length, data });
});



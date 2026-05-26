import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReportService } from '../services/ReportService';
import User from '../models/User';
import { Roles } from '../types/Roles';
import { ImageService } from '../services/ImageService';
import {
    CreateReportInput,
    createReportSchema,
    requestReportReanalysisSchema,
    RequestReportReanalysisInput,
    reportStatusSchema,
    UpdateReportStatusInput,
    listReportsFilterSchema
} from '../schemas/reportsSchema';

function normalizeCreateReportBody(body: Record<string, unknown>) {
    return {
        reportedUserId: body.reportedUserId ?? body.reported_user_id ?? body.reportedUSerid ?? body.reportedUserid,
        targetType: body.targetType ?? body.target_type ?? body.targettype ?? body.taryptyTYPE,
        targetId: body.targetId ?? body.target_id ?? body.targetID,
        reason: body.reason ?? body.reasion,
    };
}

/**
 * Criar Denúncia
 * Qualquer usuário autenticado pode denunciar.
 */
export const createReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const body = createReportSchema.parse(normalizeCreateReportBody(req.body)) as CreateReportInput;
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const uploads = await Promise.all(files.map((file, index) => ImageService.uploadReportImage({
        buffer: file.buffer,
        mimetype: file.mimetype,
    }, userId, index)));
    const data = await ReportService.createReport(userId, body, uploads.map((upload) => upload.secure_url));

    res.status(201).json({
        success: true,
        message: 'Denuncia registrada com sucesso',
        data
    });
});

/**
 * Minhas Denúncias
 * Lista as denúncias feitas pelo usuário autenticado.
 */
export const getMyReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReportService.getMyReports(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Listar Todas as Denúncias
 * Apenas MANAGER e ADMIN.
 */
export const listReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filterResult = listReportsFilterSchema.safeParse(req.query);

    if (!filterResult.success) {
        return res.status(400).json({ success: false, message: 'Filtros de denuncia invalidos' });
    }

    const data = await ReportService.searchReportsAdmin({
        status: filterResult.data.status,
        targetType: filterResult.data.targetType,
    });

    res.status(200).json({ success: true, total: data.length, data });
});

/**
 * Detalhes da Denúncia
 * Dono da denúncia, alvo ou ADMIN/MANAGER.
 */
export const getReportById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);
    const role = req.user?.role;
    const hasAdminAccess = role === Roles.ADMIN || role === Roles.MANAGER;
    const data = await ReportService.getById(id, userId, hasAdminAccess);

    res.status(200).json({ success: true, data });
});

/**
 * Atualizar Status da Denúncia
 * Apenas ADMIN e MANAGER.
 */
export const updateReportStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await ReportService.updateStatus(id, req.body as UpdateReportStatusInput);

    res.status(200).json({
        success: true,
        message: 'Status da denuncia atualizado',
        data
    });
});

/**
 * Solicitar Reanálise
 * O alvo da denúncia pode solicitar reanálise.
 */
export const requestReportReanalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);
    const body = requestReportReanalysisSchema.parse(req.body) as RequestReportReanalysisInput;
    const data = await ReportService.requestReanalysis(id, userId, body);

    res.status(200).json({
        success: true,
        message: 'Reanalise solicitada com sucesso',
        data
    });
});

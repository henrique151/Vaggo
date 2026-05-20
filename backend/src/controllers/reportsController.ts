import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ReportService } from '../services/ReportService';
import User from '../models/User';
import { ImageService } from '../services/ImageService';
import {
    CreateReportInput,
    createReportSchema,
    requestReportReanalysisSchema,
    RequestReportReanalysisInput,
    reportStatusSchema,
    UpdateReportStatusInput
} from '../schemas/reportsSchema';

function normalizeCreateReportBody(body: Record<string, unknown>) {
    return {
        reportedUserId: body.reportedUserId ?? body.reported_user_id ?? body.reportedUSerid ?? body.reportedUserid,
        targetType: body.targetType ?? body.target_type ?? body.targettype ?? body.taryptyTYPE,
        targetId: body.targetId ?? body.target_id ?? body.targetID,
        reason: body.reason ?? body.reasion,
    };
}

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

export const getMyReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const data = await ReportService.getMyReports(userId);

    res.status(200).json({ success: true, total: data.length, data });
});

export const listReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const statusResult = req.query.status
        ? reportStatusSchema.safeParse(req.query.status)
        : null;

    if (statusResult && !statusResult.success) {
        return res.status(400).json({ success: false, message: 'Status de denuncia invalido' });
    }

    const data = await ReportService.listReports(statusResult?.data);

    res.status(200).json({ success: true, total: data.length, data });
});

export const getReportById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);
    const user = await User.findByPk(userId);
    const data = await ReportService.getById(id, userId, Boolean(user?.isAdmin));

    res.status(200).json({ success: true, data });
});

export const updateReportStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const data = await ReportService.updateStatus(id, req.body as UpdateReportStatusInput);

    res.status(200).json({
        success: true,
        message: 'Status da denuncia atualizado',
        data
    });
});

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

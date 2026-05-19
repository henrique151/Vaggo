import { z } from 'zod';

const parseNumberInput = (value: unknown) => {
    if (typeof value !== 'string') {
        return value;
    }

    const parsed = Number(value.trim());
    return Number.isNaN(parsed) ? value : parsed;
};

export const reportStatusSchema = z.enum(['PENDENTE', 'EM_ANALISE', 'RESOLVIDA', 'RECUSADA', 'REANALISE'], {
    error: 'Status de denuncia invalido'
});

export const createReportSchema = z.object({
    spotId: z.preprocess(
        parseNumberInput,
        z.number({ error: 'ID da vaga deve ser um numero' }).int().positive()
    ),
    description: z.string().trim().min(5, 'Descricao deve ter pelo menos 5 caracteres').max(500),
    reason: z.string().trim().max(255).optional()
}).strict();

export const updateReportStatusSchema = z.object({
    status: reportStatusSchema,
    adminNote: z.string().trim().max(500).optional(),
    suspendSpot: z.boolean().optional().default(false)
}).strict();

export const requestReportReanalysisSchema = z.object({
    description: z.string().trim().min(5, 'Descricao deve ter pelo menos 5 caracteres').max(500),
    reason: z.string().trim().max(255).optional()
}).strict();

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type RequestReportReanalysisInput = z.infer<typeof requestReportReanalysisSchema>;
export type ReportStatusInput = z.infer<typeof reportStatusSchema>;

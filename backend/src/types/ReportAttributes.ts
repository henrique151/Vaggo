export interface ReportAttributes {
    id: number;
    description: string;
    reason: string | null;
    status: 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDA' | 'RECUSADA' | 'REANALISE';
    adminNote: string | null;
    userId: number;
    spotId: number | null;
    reportedUserId?: number | null;
    targetType: 'CHAT' | 'SPOT';
    targetId: number;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    reviewedAt: Date | null;
}

export interface ReportAttributes {
    id: number;
    description: string;
    reason: string | null;
    status: 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDA' | 'RECUSADA' | 'REANALISE';
    adminNote: string | null;
    userId: number;
    spotId: number;
    createdAt: Date;
    updatedAt: Date;
    reviewedAt: Date | null;
}

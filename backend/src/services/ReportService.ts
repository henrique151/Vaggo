import type { WhereOptions } from 'sequelize';
import sequelize from '../database';
import Report from '../models/Report';
import Spot from '../models/Spot';
import User from '../models/User';
import Property from '../models/Property';
import {
    CreateReportInput,
    RequestReportReanalysisInput,
    ReportStatusInput,
    UpdateReportStatusInput
} from '../schemas/reportsSchema';

export class ReportService {
    private static readonly defaultInclude = [
        { model: User, as: 'reporter', attributes: ['id', 'email', 'avatarUrl'] },
        {
            model: Spot,
            as: 'spot',
            attributes: ['id', 'identifier', 'status', 'isActive', 'propertyId'],
            include: [{ model: Property, as: 'property', attributes: ['id', 'name'] }]
        }
    ];

    static async createReport(userId: number, data: CreateReportInput) {
        const spot = await Spot.findByPk(data.spotId);
        if (!spot) throw new Error('SPOT_NOT_FOUND');

        const report = await Report.create({
            userId,
            spotId: data.spotId,
            description: data.description,
            reason: data.reason ?? null
        });

        return this.getById(report.id, userId, false);
    }

    static async getMyReports(userId: number) {
        return Report.findAll({
            where: { userId },
            include: this.defaultInclude,
            order: [['createdAt', 'DESC']]
        });
    }

    static async listReports(status?: ReportStatusInput) {
        const where: WhereOptions = status ? { status } : {};

        return Report.findAll({
            where,
            include: this.defaultInclude,
            order: [['createdAt', 'DESC']]
        });
    }

    static async getById(id: number, userId: number, isAdmin: boolean) {
        const report = await Report.findByPk(id, {
            include: this.defaultInclude
        });

        if (!report) throw new Error('REPORT_NOT_FOUND');
        if (!isAdmin && report.userId !== userId) throw new Error('FORBIDDEN');

        return report;
    }

    static async updateStatus(id: number, data: UpdateReportStatusInput) {
        const transaction = await sequelize.transaction();

        try {
            const report = await Report.findByPk(id, { transaction });
            if (!report) throw new Error('REPORT_NOT_FOUND');

            await report.update({
                status: data.status,
                adminNote: data.adminNote ?? report.adminNote,
                reviewedAt: new Date()
            }, { transaction });

            if (data.suspendSpot) {
                const spot = await Spot.findByPk(report.spotId, { transaction });
                if (!spot) throw new Error('SPOT_NOT_FOUND');

                await spot.update({
                    isActive: false,
                    status: 'INDISPONIVEL'
                }, { transaction });
            }

            await transaction.commit();
            return this.getById(report.id, 0, true);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async requestReanalysis(id: number, userId: number, data: RequestReportReanalysisInput) {
        const report = await Report.findByPk(id);
        if (!report) throw new Error('REPORT_NOT_FOUND');
        if (report.userId !== userId) throw new Error('FORBIDDEN');
        if (!['RESOLVIDA', 'RECUSADA'].includes(report.status)) {
            throw new Error('REPORT_REANALYSIS_NOT_ALLOWED');
        }

        await report.update({
            status: 'REANALISE',
            description: data.description,
            reason: data.reason ?? report.reason,
            reviewedAt: null
        });

        return this.getById(report.id, userId, false);
    }
}

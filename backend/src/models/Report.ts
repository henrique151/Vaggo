import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { ReportAttributes } from '../types/ReportAttributes';

export interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'status' | 'reason' | 'adminNote' | 'createdAt' | 'updatedAt' | 'reviewedAt'> { }

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
    public id!: number;
    public description!: string;
    public reason!: string | null;
    public status!: 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDA' | 'RECUSADA' | 'REANALISE';
    public adminNote!: string | null;
    public userId!: number;
    public spotId!: number | null;
    public reportedUserId!: number | null;
    public targetType!: 'CHAT' | 'SPOT';
    public targetId!: number;
    public images!: string[];
    public createdAt!: Date;
    public updatedAt!: Date;
    public reviewedAt!: Date | null;
}

Report.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'DEN_INT_ID'
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'DEN_STR_DESCRICAO'
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'DEN_STR_MOTIVO'
    },
    status: {
        type: DataTypes.ENUM('PENDENTE', 'EM_ANALISE', 'RESOLVIDA', 'RECUSADA', 'REANALISE'),
        allowNull: false,
        defaultValue: 'PENDENTE',
        field: 'DEN_STR_STATUS'
    },
    adminNote: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'DEN_STR_NOTA_ADMIN'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_ID'
    },
    spotId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'VAG_INT_ID'
    },
    reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'USU_INT_REPORTED_ID'
    },
    targetType: {
        type: DataTypes.ENUM('CHAT', 'SPOT'),
        allowNull: false,
        defaultValue: 'SPOT',
        field: 'DEN_STR_TARGET_TYPE'
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'DEN_INT_TARGET_ID'
    },
    images: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'DEN_JSON_IMAGES'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'DEN_DATE_CRIADO_EM'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'DEN_DATE_ATUALIZADO_EM'
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'DEN_DATE_ANALISADO_EM'
    }
}, {
    sequelize,
    tableName: 'reports',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

export default Report;

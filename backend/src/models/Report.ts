import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { ReportAttributes } from '../types/ReportAttributes';


export interface ReportCreationAttributes extends Optional<ReportAttributes, 'id'> { }

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
    public id!: number;
    public comment!: string;
    public userId!: number;
    public propertyId!: number;
}

Report.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'DEN_INT_ID'
    },
    comment: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'DEN_STR_COMENTARIO'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_ID'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PRO_INT_ID'
    }
}, {
    sequelize,
    tableName: 'reports',
    timestamps: false
});

export default Report;
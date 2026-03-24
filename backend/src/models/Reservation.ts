import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { ReservationAttributes } from '../types/ReservationAttributes';

export interface ReservationCreationAttributes extends Optional<ReservationAttributes, 'id'> { }

class Reservation extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
    public id!: number;
    public status!: 'AGENDADA' | 'EM ANDAMENTO' | 'CONCLUIDA' | 'DESCONHECIDO';
    public startDate!: Date;
    public endDate!: Date;
    public totalValue!: number;
    public createdAtDate!: Date;
    public confirmationCode!: string;
    public vehicleId!: number;
    public spotId!: number;
}

Reservation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'RES_INT_ID'
    },
    status: {
        type: DataTypes.ENUM('AGENDADA', 'EM ANDAMENTO', 'CONCLUIDA', 'DESCONHECIDO'),
        allowNull: false,
        field: 'RES_STATUS'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'RES_DATA_INICIO'
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'RES_DATA_FIM'
    },
    totalValue: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        field: 'RES_DEC_VALOR_TOTAL'
    },
    createdAtDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'RES_DATR_CRIACAO'
    },
    confirmationCode: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: 'RES_STR_CODIGO_CONFIRM'
    },
    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VEI_INT_ID'
    },
    spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VAG_INT_ID'
    }
}, {
    sequelize,
    tableName: 'reservations',
    timestamps: false
});

export default Reservation;
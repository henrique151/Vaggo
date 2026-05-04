import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { ReservationAttributes } from '../types/ReservationAttributes';
import type Spot from './Spot';
import type Vehicle from './Vehicle';
import type User from './User';

export interface ReservationCreationAttributes extends Optional<ReservationAttributes, 'id'> { }
class Reservation extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
    public id!: number;
    public spotId!: number;
    public vehicleId!: number;
    public userId!: number;
    public startDate!: string;
    public endDate!: string;
    public status!: 'PENDENTE' | 'APROVADA' | 'RECUSADA' | 'CANCELADA';
    public code!: string;
    public spot?: Spot;
    public vehicle?: Vehicle;
    public user?: User;
}

Reservation.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'RES_INT_ID'
    },
    spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VAG_INT_ID'
    },
    vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VEI_INT_ID'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_ID'
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'RES_DATE_START'
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'RES_DATE_END'
    },
    status: {
        type: DataTypes.ENUM('PENDENTE', 'APROVADA', 'RECUSADA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'PENDENTE',
        field: 'RES_STR_STATUS'
    },
    code: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true,
        field: 'RES_STR_CODE'
    },
}, {
    sequelize,
    tableName: 'reservations',
    timestamps: false
});

export default Reservation;

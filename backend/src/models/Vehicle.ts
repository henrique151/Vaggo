import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { VehicleAttributes } from '../types/VehicleAttributes';

export interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id'> { }

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
    public id!: number;
    public brand!: string;
    public model!: string;
    public color!: string;
    public licensePlate!: string;
    public manufactureYear!: string;
    public isActive!: boolean;
    public userId!: number;
}

Vehicle.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'VEI_INT_ID'
    },
    brand: {
        type: DataTypes.STRING(30),
        allowNull: false,
        field: 'VEI_STR_MARCA'
    },
    model: {
        type: DataTypes.STRING(25),
        allowNull: false,
        field: 'VEI_STR_MODELO'
    },
    color: {
        type: DataTypes.STRING(30),
        allowNull: false,
        field: 'VEI_STR_COR'
    },
    licensePlate: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        field: 'VEI_STR_PLACA'
    },
    manufactureYear: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'VEI_DATE_ANOFABRICACAO'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'VEI_BOL_ATIVO'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_ID'
    }
}, {
    sequelize,
    tableName: 'vehicles',
    timestamps: false
});

export default Vehicle;
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { VehicleAttributes } from '../types/VehicleAttributes';

export interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id' | 'isActive'> { }

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
    public id!: number;
    public brand!: string;
    public model!: string;
    public color!: string;
    public licensePlate!: string;
    public manufactureYear!: string;
    public type!: 'CARRO' | 'MOTO';
    public size!: 'PEQUENO' | 'MEDIO' | 'GRANDE';
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
    type: {
        type: DataTypes.ENUM('CARRO', 'MOTO'),
        allowNull: false,
        field: 'VEI_STR_TIPO_VEICULO'
    },
    size: {
        type: DataTypes.ENUM('PEQUENO', 'MEDIO', 'GRANDE'),
        allowNull: false,
        field: 'VEI_STR_TAMANHO'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
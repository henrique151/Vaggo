import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { PropertyAttributes } from '../types/PropertyAttributes';

export interface PropertyCreationAttributes extends Optional<PropertyAttributes, 'id'> { }

class Property extends Model<PropertyAttributes, PropertyCreationAttributes> implements PropertyAttributes {
    public id!: number;
    public name!: string;
    public type!: string;
    public description!: string;
    public isActive!: boolean;
    public totalCapacity!: number;
    public addressId!: number;
}

Property.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'PRO_INT_ID'
    },
    name: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: 'PRO_STR_NOME'
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'PRO_STR_TIPO'
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'PRO_STR_DESCRICAO'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'PRO_BOL_ATIVA'
    },
    totalCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PRO_INT_CAPACIDADE_TOTAL'
    },
    addressId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'END_INT_ID'
    }
}, {
    sequelize,
    tableName: 'propertys',
    timestamps: false
});

export default Property;
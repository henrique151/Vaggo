import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { PropertyUserAttributes } from '../types/PropertyUserAttributes';

export interface PropertyUserCreationAttributes extends Optional<PropertyUserAttributes, 'id'> { }

class PropertyUser extends Model<PropertyUserAttributes, PropertyUserCreationAttributes> implements PropertyUserAttributes {
    public id!: number;
    public userId!: number;
    public propertyId!: number;
    public role!: 'MORADOR' | 'DONO';
}

PropertyUser.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'MOR_INT_ID'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_ID',
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PRO_INT_ID',
    },
    role: {
        type: DataTypes.ENUM('MORADOR', 'DONO'),
        allowNull: false,
        field: 'MOR_STR_TIPO'
    }
}, {
    sequelize,
    tableName: 'property_users',
    timestamps: false
});

export default PropertyUser;
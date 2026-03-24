import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { SpotAttributes } from '../types/SpotAttributes';

export interface SpotCreationAttributes extends Optional<SpotAttributes, 'id'> { }

class Spot extends Model<SpotAttributes, SpotCreationAttributes> implements SpotAttributes {
    public id!: number;
    public size!: number;
    public status!: 'DISPONÍVEL' | 'INDISPONÍVEL' | 'OCUPADA';
    public identifier!: string;
    public isCovered!: boolean;
    public isActive!: boolean;
    public propertyId!: number;
}

Spot.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'VAG_INT_ID'
    },
    size: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        field: 'VAG_DEC_TAMANHO'
    },
    status: {
        type: DataTypes.ENUM('DISPONÍVEL', 'INDISPONÍVEL', 'OCUPADA'),
        allowNull: false,
        field: 'VAG_BOL_OCUPADA'
    },
    identifier: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: 'VAG_STR_IDENTIFICADOR'
    },
    isCovered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'VAG_BOL_COBERTA'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'VAG_BOL_ATIVA'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PRO_INT_ID'
    }
}, {
    sequelize,
    tableName: 'spots',
    timestamps: false
});

export default Spot;
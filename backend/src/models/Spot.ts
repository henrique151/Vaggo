import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { SpotAttributes } from '../types/SpotAttributes';

export interface SpotCreationAttributes extends Optional<SpotAttributes, 'id'> { }

class Spot extends Model<SpotAttributes, SpotCreationAttributes> implements SpotAttributes {
    public id!: number;
    public price!: number;
    public size!: number;
    public status!: 'DISPONIVEL' | 'INDISPONIVEL' | 'OCUPADA';
    public identifier!: string;
    public isCovered!: boolean;
    public approvalStatus!: 'PENDENTE' | 'APROVADA' | 'RECUSADA';
    public allowedVehicles!: ('CARRO' | 'MOTO')[];
    public operatingHours!: Record<string, { start: string; end: string }> | null;
    public isActive!: boolean;
    public propertyId!: number;
    public imageUrl!: string;
}

Spot.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'VAG_INT_ID'
    },
    price: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'VAG_DEC_PRECO'
    },
    size: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        field: 'VAG_DEC_TAMANHO'
    },
    status: {
        type: DataTypes.ENUM('DISPONIVEL', 'INDISPONIVEL', 'OCUPADA'),
        allowNull: false,
        field: 'VAG_STR_OCUPADA'
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
    approvalStatus: {
        type: DataTypes.ENUM('PENDENTE', 'APROVADA', 'RECUSADA'),
        allowNull: false,
        defaultValue: 'PENDENTE',
        field: 'VAG_STR_STATUS_APROVACAO'
    },
    allowedVehicles: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'VAG_JSN_VEICULOS_PERMITIDOS'
    },
    operatingHours: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'VAG_JSN_HORARIOS_FUNCIONAMENTO'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'VAG_BOL_ATIVA'
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'VAG_STR_IMAGEM_URL'
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

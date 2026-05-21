import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { ConversationAttributes } from '../types/ConversationAttributes';

export interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'deletedBy' | 'createdAt' | 'updatedAt'> { }

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
    public id!: number;
    public solicitationId!: number;
    public propertyId!: number;
    public userRequesterId!: number;
    public userOwnerId!: number;
    public deletedBy!: number[];
    public createdAt?: Date;
    public updatedAt?: Date;
}

Conversation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'CON_INT_ID'
    },
    solicitationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'RES_INT_ID'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PRO_INT_ID'
    },
    userRequesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_SOLICITANTE_ID'
    },
    userOwnerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_DONO_ID'
    },
    deletedBy: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'CON_JSON_DELETED_BY'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'CON_DATE_CRIADO_EM'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'CON_DATE_ATUALIZADO_EM'
    },
}, {
    sequelize,
    tableName: 'conversations',
    timestamps: true
});

export default Conversation;

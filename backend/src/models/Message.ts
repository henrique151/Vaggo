import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { MessageAttributes } from '../types/MessageAttributes';

export interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'> { }

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
    public id!: number;
    public conversationId!: number;
    public senderId!: number;
    public content?: string | null;
    public imageUrl?: string | null;
    public isEdited!: boolean;
    public isDeleted!: boolean;
    public createdAt?: Date;
    public updatedAt?: Date;
}

Message.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'MEN_INT_ID'
    },
    conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'CON_INT_ID'
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_REMETENTE_ID'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'MEN_TXT_CONTENT'
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'MEN_STR_IMAGE_URL'
    },
    isEdited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'MEN_BOL_EDITADO'
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'MEN_BOL_EXCLUIDO'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'MEN_DATE_CRIADO_EM'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'MEN_DATE_ATUALIZADO_EM'
    },
}, {
    sequelize,
    tableName: 'messages',
    timestamps: true
});

export default Message;

import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { UserAttributes } from '../types/UserAttributes';

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public lastLogin!: Date;
    public isBlocked!: boolean;
    public isAdmin!: boolean;
    public permissionLevel!: '1' | '2' | '3';
    public avatarUrl!: string;
    public personId!: number;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'USU_INT_ID'
    },
    email: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: 'USU_STR_EMAIL'
    },
    password: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: 'USU_STR_SENHA'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'USU_DATE_ULTIMO_LOGIN'
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'USU_BOL_BLOQUEADO'
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'USU_BOL_ADMINISTRADOR'
    },
    permissionLevel: {
        type: DataTypes.ENUM('1', '2', '3'),
        allowNull: false,
        field: 'USU_STATUS_NIVELPERM'
    },
    avatarUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'USU_STR_AVATAR_URL'
    },
    personId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'PES_INT_ID'
    },
}, {
    sequelize,
    tableName: 'users',
    timestamps: false
});

export default User;
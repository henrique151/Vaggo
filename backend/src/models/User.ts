import { DataTypes, Model } from 'sequelize';
import { UserAttributes } from '../types/UserAttributes';
import sequelize from '../database';

class User extends Model<UserAttributes> implements UserAttributes {
    public id!: string;
    public username!: string;
    public email!: string;
    public firstName!: string;
    public lastName!: string;
    public age!: number;
    public password!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'firstName'
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'lastName'
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default User;

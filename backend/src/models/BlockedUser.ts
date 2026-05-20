import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { BlockedUserAttributes } from '../types/BlockedUserAttributes';

export interface BlockedUserCreationAttributes extends Optional<BlockedUserAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class BlockedUser extends Model<BlockedUserAttributes, BlockedUserCreationAttributes> implements BlockedUserAttributes {
    public id!: number;
    public blockerId!: number;
    public blockedId!: number;
    public createdAt?: Date;
    public updatedAt?: Date;
}

BlockedUser.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'BLK_INT_ID'
    },
    blockerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_BLOCKER_ID'
    },
    blockedId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_BLOCKED_ID'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'BLK_DATE_CRIADO_EM'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'BLK_DATE_ATUALIZADO_EM'
    },
}, {
    sequelize,
    tableName: 'blocked_users',
    timestamps: true
});

export default BlockedUser;

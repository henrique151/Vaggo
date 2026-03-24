import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { StateAttributes } from '../types/StateAttributes';

export interface StateCreationAttributes extends Optional<StateAttributes, 'id'> { }

class State extends Model<StateAttributes, StateCreationAttributes> implements StateAttributes {
    public id!: number;
    public acronymState!: string;
}

State.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'EST_INT_ID'
    },
    acronymState: {
        type: DataTypes.CHAR(2),
        allowNull: false,
        unique: true,
        field: 'EST_STR_UF'
    }
}, {
    sequelize,
    tableName: 'states',
    timestamps: false
});

export default State;
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { CityAttributes } from '../types/CityAttributes';

export interface CityCreationAttributes extends Optional<CityAttributes, 'id'> { }

class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
    public id!: number;
    public name!: string;
    public stateId!: number;
}

City.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'CID_INT_ID'
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        field: 'CID_STR_NOME'
    },
    stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'EST_INT_ID'
    }
}, {
    sequelize,
    tableName: 'cities',
    timestamps: false
});

export default City;
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { SpotAvailabilityAttributes } from '../types/SpotAvailabilityAttributes';

export interface SpotAvailabilityCreationAttributes extends Optional<SpotAvailabilityAttributes, 'id'> { }

class SpotAvailability extends Model<SpotAvailabilityAttributes, SpotAvailabilityCreationAttributes> implements SpotAvailabilityAttributes {
    public id!: number;
    public spotId!: number;
    public weekdays!: number;
    public startDate!: string | null;
    public endDate!: string | null;
    public startTime!: string;
    public endTime!: string;
}

SpotAvailability.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'SAV_INT_ID'
    },
    spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VAG_INT_ID'
    },
    weekdays: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        defaultValue: 127,
        field: 'SAV_INT_WEEKDAYS'
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'SAV_DATE_START'
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'SAV_DATE_END'
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '00:00:00',
        field: 'SAV_TIME_START'
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '23:59:00',
        field: 'SAV_TIME_END'
    },
}, {
    sequelize,
    tableName: 'spot_availabilities',
    timestamps: false
});

export default SpotAvailability;

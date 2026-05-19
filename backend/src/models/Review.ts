import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { ReviewAttributes } from '../types/ReviewAttributes';

export interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'reviewDate'> { }

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public id!: number;
    public rating!: number;
    public comment!: string;
    public reviewDate!: Date;
    public userId!: number;
    public spotId!: number;
    public propertyId!: number;
    public reservationId!: number;
}

Review.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'AVA_INT_ID'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'AVA_INT_NOTA'
    },
    comment: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'AVA_STR_COMENTARIO'
    },
    reviewDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'AVA_DATE_DATA_AVALIACAO'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'USU_INT_ID'
    },
    spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'VAG_INT_ID'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'PRO_INT_ID'
    },
    reservationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'RES_INT_ID'
    }
}, {
    sequelize,
    tableName: 'reviews',
    timestamps: false
});

export default Review;

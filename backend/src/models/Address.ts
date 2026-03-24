import { Model, DataTypes, Optional } from "sequelize";
import sequelize from '../database';
import { AddressAttributes } from "../types/AddressAttributes";

export interface AddressCreationAttributes extends Optional<AddressAttributes, 'id'> { }

class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
    public id!: number;
    public street!: string;
    public neighborhood!: string;
    public zipCode!: string;
    public cityId!: number;
}

Address.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "END_INT_ID",
    },
    street: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: "END_STR_RUA"
    },
    neighborhood: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: "END_STR_BAIRRO",
    },
    zipCode: {
        type: DataTypes.CHAR(8),
        allowNull: false,
        field: "END_STR_CEP"
    },
    cityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "CID_INT_ID",
    },
}, {
    sequelize,
    tableName: "address",
    timestamps: false
});

export default Address;

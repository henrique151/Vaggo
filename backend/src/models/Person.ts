import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';
import { PersonAttributes } from '../types/PersonAttributes';

export interface PersonCreationAttributes extends Optional<PersonAttributes, 'id'> { }

class Person extends Model<PersonAttributes, PersonCreationAttributes> implements PersonAttributes {
    public id!: number;
    public name!: string;
    public cpf!: string;
    public gender!: string;
    public phone!: string;
    public birthDate!: Date;
    public registrationDate: Date;
    public isActive: boolean;
}

Person.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'PES_INT_ID'
    },
    name: {
        type: DataTypes.STRING(70),
        allowNull: false,
        field: 'PES_STR_NOME'
    },
    cpf: {
        type: DataTypes.CHAR(11),
        allowNull: false,
        unique: true,
        field: 'PES_STR_CPF'
    },
    gender: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        field: 'PES_STR_SEXO'
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        field: 'PES_STR_PHONE'
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'PES_DATE_NASCIMENTO'
    },
    registrationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'PES_DATE_CADASTRO'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'PES_BOL_ATIVO'
    }
}, {
    sequelize,

    tableName: 'persons',
    timestamps: false
});

export default Person;
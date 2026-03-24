"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("persons", {
      PES_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      PES_STR_NOME: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      PES_STR_CPF: {
        type: Sequelize.CHAR(11),
        allowNull: false,
        unique: true,
      },
      PES_STR_SEXO: {
        type: Sequelize.CHAR(1),
        allowNull: false,
      },
      PES_STR_PHONE: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      PES_DATE_NASCIMENTO: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      PES_DATE_CADASTRO: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      PES_BOL_ATIVO: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: "persons" });
  },
};

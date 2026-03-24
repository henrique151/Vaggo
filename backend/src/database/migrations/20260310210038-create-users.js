"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "users",
      {
        USU_INT_ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        USU_STR_EMAIL: {
          type: Sequelize.STRING(70),
          allowNull: false,
          unique: true,
        },
        USU_STR_SENHA: {
          type: Sequelize.STRING(70),
          allowNull: false,
        },
        USU_STR_TIPO: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        USU_DATE_ULTIMO_LOGIN: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        USU_BOL_BLOQUEADO: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        USU_BOL_ADMINISTRADOR: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        USU_STATUS_NIVELPERM: {
          type: Sequelize.ENUM("1", "2", "3"),
          allowNull: false,
        },
        PES_INT_ID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
        },
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: "users" });
  },
};

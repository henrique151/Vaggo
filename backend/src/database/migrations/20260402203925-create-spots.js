"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("spots", {
      VAG_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      VAG_DEC_TAMANHO: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      VAG_STR_OCUPADA: {
        type: Sequelize.ENUM("DISPONIVEL", "INDISPONIVEL", "OCUPADA"),
        allowNull: false,
        defaultValue: "DISPONIVEL",
      },
      VAG_STR_IDENTIFICADOR: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      VAG_BOL_COBERTA: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      VAG_BOL_ATIVA: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      PRO_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: "spots" });
  },
};

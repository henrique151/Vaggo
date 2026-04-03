"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("addresses", {
      END_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      END_STR_RUA: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      END_STR_NUMERO: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      END_STR_BAIRRO: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      END_STR_CEP: {
        type: Sequelize.CHAR(8),
        allowNull: false,
      },
      CID_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: "addresses" });
  },
};

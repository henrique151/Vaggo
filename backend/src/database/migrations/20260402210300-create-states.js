"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("states", {
      EST_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      EST_STR_NOME: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      EST_STR_UF: {
        type: Sequelize.CHAR(2),
        unique: true,
        allowNull: null,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: "states" });
  },
};

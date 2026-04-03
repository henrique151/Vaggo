"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("propertys_users", {
      MOR_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      USU_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      PRO_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      MOR_STR_TIPO: {
        type: Sequelize.ENUM("MORADOR", "DONO"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: "propertys_users" });
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cities", {
      CID_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: true,
      },
      CID_STR_NOME: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      EST_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });
    await queryInterface.addIndex("cities", ["CID_STR_NOME"], {
      name: "idx_cities_name",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("cities", "idx_cities_name");
    await queryInterface.dropTable({ tableName: "cities" });
  },
};

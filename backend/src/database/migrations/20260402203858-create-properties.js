"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("properties", {
      PRO_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      PRO_STR_NOME: {
        type: Sequelize.STRING(70),
        allowNull: false,
      },
      PRO_STR_TIPO: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      PRO_STR_DESCRICAO: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      PRO_BOL_ATIVA: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      PRO_INT_CAPACIDADE_TOTAL: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      PRO_JSON_IMAGENS: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      PRO_DEC_LATITUDE: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      PRO_DEC_LONGITUDE: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      END_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
    await queryInterface.addIndex(
      "properties",
      ["PRO_DEC_LATITUDE", "PRO_DEC_LONGITUDE"],
      {
        name: "idx_properties_lat_lng",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: "properties" });
           await queryInterface.removeIndex(
             "properties",
             "idx_properties_lat_lng",
           );

  },
};

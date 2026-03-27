"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vehicles", {
      VEI_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VEI_STR_MARCA: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      VEI_STR_MODELO: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      VEI_STR_COR: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      VEI_STR_PLACA: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      VEI_DATE_ANOFABRICACAO: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      VEI_BOL_ATIVO: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      USU_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("vehicles");
  },
};

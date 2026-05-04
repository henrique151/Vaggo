"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reservations", {
      RES_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VAG_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "spots", key: "VAG_INT_ID" },
      },
      VEI_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "vehicles", key: "VEI_INT_ID" },
      },
      USU_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
      },
      RES_DATE_START: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      RES_DATE_END: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      RES_STR_STATUS: {
        type: Sequelize.ENUM("PENDENTE", "APROVADA", "RECUSADA", "CANCELADA"),
        allowNull: false,
        defaultValue: "PENDENTE",
      },
      RES_STR_CODE: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },
    });

    await queryInterface.addIndex(
      "reservations",
      ["VAG_INT_ID", "RES_DATE_START", "RES_DATE_END", "RES_STR_STATUS"],
      {
        name: "idx_reservations_spot_period_status",
      },
    );

    await queryInterface.addIndex("reservations", ["RES_STR_CODE"], {
      name: "idx_reservations_code",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("reservations", "idx_reservations_spot_period_status");
    await queryInterface.removeIndex("reservations", "idx_reservations_code");
    await queryInterface.dropTable("reservations");
  },
};

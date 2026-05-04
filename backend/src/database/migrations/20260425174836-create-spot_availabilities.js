"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("spot_availabilities", {
      SAV_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      VAG_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "spots", key: "VAG_INT_ID" },
        onDelete: "CASCADE",
      },
      SAV_INT_WEEKDAYS: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 127,
      },
      SAV_DATE_START: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      SAV_DATE_END: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      SAV_TIME_START: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: "00:00:00",
      },
      SAV_TIME_END: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: "23:59:00",
      },
    });
    await queryInterface.addIndex(
      "spot_availabilities",
      ["VAG_INT_ID", "SAV_INT_WEEKDAYS", "SAV_DATE_START", "SAV_DATE_END"],
      {
        name: "idx_spot_availability_filters",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("spot_availabilities");
    await queryInterface.removeIndex(
      "spot_availabilities",
      "idx_spot_availability_filters",
    );
  },
};

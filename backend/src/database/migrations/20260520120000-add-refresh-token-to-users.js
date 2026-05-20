"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "USU_STR_REFRESH_TOKEN_HASH", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("users", "USU_DATE_REFRESH_TOKEN_EXPIRES", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "USU_STR_REFRESH_TOKEN_HASH");
    await queryInterface.removeColumn("users", "USU_DATE_REFRESH_TOKEN_EXPIRES");
  },
};

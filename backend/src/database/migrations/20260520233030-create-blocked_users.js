"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("blocked_users", {
      BLK_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      USU_INT_BLOCKER_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      USU_INT_BLOCKED_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      BLK_DATE_CRIADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      BLK_DATE_ATUALIZADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "blocked_users",
      ["USU_INT_BLOCKER_ID", "USU_INT_BLOCKED_ID"],
      {
        name: "idx_blocked_users_pair",
        unique: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("blocked_users", "idx_blocked_users_pair");
    await queryInterface.dropTable("blocked_users");
  },
};

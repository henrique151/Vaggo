"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      MEN_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      CON_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "conversations", key: "CON_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      USU_INT_REMETENTE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      MEN_TXT_CONTENT: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      MEN_STR_IMAGE_URL: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      MEN_BOL_EDITADO: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      MEN_BOL_EXCLUIDO: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      MEN_DATE_CRIADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      MEN_DATE_ATUALIZADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "messages",
      ["CON_INT_ID", "MEN_DATE_CRIADO_EM"],
      {
        name: "idx_messages_conversation_created_at",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "messages",
      "idx_messages_conversation_created_at",
    );
    await queryInterface.dropTable("messages");
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("conversations", {
      CON_INT_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      RES_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "reservations", key: "RES_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      PRO_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "properties", key: "PRO_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      USU_INT_SOLICITANTE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      USU_INT_DONO_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      CON_JSON_DELETED_BY: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      CON_DATE_CRIADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      CON_DATE_ATUALIZADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("conversations", ["RES_INT_ID"], {
      name: "idx_conversations_solicitation",
      unique: true,
    });
    await queryInterface.addIndex("conversations", ["USU_INT_SOLICITANTE_ID"], {
      name: "idx_conversations_requester",
    });
    await queryInterface.addIndex("conversations", ["USU_INT_DONO_ID"], {
      name: "idx_conversations_owner",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "conversations",
      "idx_conversations_owner",
    );
    await queryInterface.removeIndex(
      "conversations",
      "idx_conversations_requester",
    );
    await queryInterface.removeIndex(
      "conversations",
      "idx_conversations_solicitation",
    );
    await queryInterface.dropTable("conversations");
  },
};

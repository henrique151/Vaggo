"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reports", {
      DEN_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      DEN_STR_DESCRICAO: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      DEN_STR_MOTIVO: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      DEN_STR_STATUS: {
        type: Sequelize.ENUM(
          "PENDENTE",
          "EM_ANALISE",
          "RESOLVIDA",
          "RECUSADA",
          "REANALISE",
        ),
        allowNull: false,
        defaultValue: "PENDENTE",
      },
      DEN_STR_NOTA_ADMIN: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      USU_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
      },
      VAG_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "spots", key: "VAG_INT_ID" },
      },
      DEN_DATE_CRIADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      DEN_DATE_ATUALIZADO_EM: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      DEN_DATE_ANALISADO_EM: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      DEN_STR_TARGET_TYPE: {
        type: Sequelize.ENUM("SPOT", "CHAT"),
        allowNull: false,
        defaultValue: "SPOT",
      },
      DEN_INT_TARGET_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      USU_INT_REPORTED_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "USU_INT_ID" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      DEN_JSON_IMAGES: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
    });

    await queryInterface.addIndex("reports", ["USU_INT_ID"], {
      name: "idx_reports_user",
    });

    await queryInterface.addIndex("reports", ["VAG_INT_ID", "DEN_STR_STATUS"], {
      name: "idx_reports_spot_status",
    });

    await queryInterface.addIndex(
      "reports",
      ["DEN_STR_TARGET_TYPE", "DEN_INT_TARGET_ID"],
      {
        name: "idx_reports_target",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("reports", "idx_reports_target");
    await queryInterface.removeIndex("reports", "idx_reports_spot_status");
    await queryInterface.removeIndex("reports", "idx_reports_user");

    await queryInterface.dropTable("reports");
  },
};

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
        type: Sequelize.ENUM("PENDENTE", "EM_ANALISE", "RESOLVIDA", "RECUSADA", "REANALISE"),
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
        allowNull: false,
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
    });

    await queryInterface.addIndex("reports", ["USU_INT_ID"], {
      name: "idx_reports_user",
    });

    await queryInterface.addIndex("reports", ["VAG_INT_ID", "DEN_STR_STATUS"], {
      name: "idx_reports_spot_status",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("reports", "idx_reports_spot_status");
    await queryInterface.removeIndex("reports", "idx_reports_user");
    await queryInterface.dropTable("reports");
  },
};

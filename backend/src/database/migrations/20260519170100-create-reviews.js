"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
      AVA_INT_ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      AVA_INT_NOTA: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      AVA_STR_COMENTARIO: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      AVA_DATE_DATA_AVALIACAO: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      USU_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "USU_INT_ID" },
      },
      PRO_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "properties", key: "PRO_INT_ID" },
      },
      VAG_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "spots", key: "VAG_INT_ID" },
      },
      RES_INT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "reservations", key: "RES_INT_ID" },
      },
    });

    await queryInterface.addIndex("reviews", ["PRO_INT_ID"], {
      name: "idx_reviews_property",
    });

    await queryInterface.addIndex("reviews", ["VAG_INT_ID"], {
      name: "idx_reviews_spot",
    });

    await queryInterface.addIndex("reviews", ["USU_INT_ID", "RES_INT_ID"], {
      name: "idx_reviews_user_reservation",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("reviews", "idx_reviews_user_reservation");
    await queryInterface.removeIndex("reviews", "idx_reviews_spot");
    await queryInterface.removeIndex("reviews", "idx_reviews_property");
    await queryInterface.dropTable("reviews");
  },
};

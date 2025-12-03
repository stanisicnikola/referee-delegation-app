"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("competitions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      short_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      season: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM("seniors", "u19", "u17", "u15", "u13"),
        allowNull: false,
        defaultValue: "seniors",
      },
      gender: {
        type: Sequelize.ENUM("male", "female"),
        allowNull: false,
        defaultValue: "male",
      },
      status: {
        type: Sequelize.ENUM("upcoming", "active", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "active",
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add indexes
    await queryInterface.addIndex("competitions", ["season"], {
      name: "idx_competitions_season",
    });
    await queryInterface.addIndex("competitions", ["status"], {
      name: "idx_competitions_status",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("competitions");
  },
};

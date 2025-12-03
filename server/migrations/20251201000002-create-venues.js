"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("venues", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      google_maps_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      notes: {
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
    await queryInterface.addIndex("venues", ["city"], {
      name: "idx_venues_city",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("venues");
  },
};

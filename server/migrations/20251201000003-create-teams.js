"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teams", {
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
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      primary_venue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "venues",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      contact_person: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "suspended"),
        allowNull: false,
        defaultValue: "active",
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
    await queryInterface.addIndex("teams", ["city"], {
      name: "idx_teams_city",
    });
    await queryInterface.addIndex("teams", ["status"], {
      name: "idx_teams_status",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("teams");
  },
};

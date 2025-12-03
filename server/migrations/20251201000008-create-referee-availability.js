"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("referee_availability", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      referee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "referees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reason: {
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
    await queryInterface.addIndex("referee_availability", ["referee_id"], {
      name: "idx_referee_availability_referee_id",
    });
    await queryInterface.addIndex("referee_availability", ["date"], {
      name: "idx_referee_availability_date",
    });

    // Unique constraint - one referee can only have one record per date
    await queryInterface.addIndex(
      "referee_availability",
      ["referee_id", "date"],
      {
        name: "idx_referee_availability_unique",
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("referee_availability");
  },
};

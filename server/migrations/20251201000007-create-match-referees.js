"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("match_referees", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      match_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "matches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      role: {
        type: Sequelize.ENUM(
          "first_referee",
          "second_referee",
          "third_referee"
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "declined"),
        allowNull: false,
        defaultValue: "pending",
      },
      response_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      decline_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      travel_cost: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.addIndex("match_referees", ["match_id"], {
      name: "idx_match_referees_match_id",
    });
    await queryInterface.addIndex("match_referees", ["referee_id"], {
      name: "idx_match_referees_referee_id",
    });
    await queryInterface.addIndex("match_referees", ["status"], {
      name: "idx_match_referees_status",
    });

    // Unique constraint - one referee can only have one role per match
    await queryInterface.addIndex(
      "match_referees",
      ["match_id", "referee_id"],
      {
        name: "idx_match_referees_unique",
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("match_referees");
  },
};

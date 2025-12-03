"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("matches", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      competition_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "competitions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      home_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "teams",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      away_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "teams",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "venues",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      round: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      match_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "scheduled",
          "in_progress",
          "completed",
          "postponed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "scheduled",
      },
      home_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      away_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      delegated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      delegated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delegation_status: {
        type: Sequelize.ENUM("pending", "partial", "complete", "confirmed"),
        allowNull: false,
        defaultValue: "pending",
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
    await queryInterface.addIndex("matches", ["competition_id"], {
      name: "idx_matches_competition_id",
    });
    await queryInterface.addIndex("matches", ["scheduled_at"], {
      name: "idx_matches_scheduled_at",
    });
    await queryInterface.addIndex("matches", ["status"], {
      name: "idx_matches_status",
    });
    await queryInterface.addIndex("matches", ["delegation_status"], {
      name: "idx_matches_delegation_status",
    });
    await queryInterface.addIndex("matches", ["home_team_id"], {
      name: "idx_matches_home_team",
    });
    await queryInterface.addIndex("matches", ["away_team_id"], {
      name: "idx_matches_away_team",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("matches");
  },
};

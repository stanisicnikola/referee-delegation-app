"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    static associate(models) {
      Match.belongsTo(models.Competition, {
        foreignKey: "competitionId",
        as: "competition",
      });

      Match.belongsTo(models.Team, {
        foreignKey: "homeTeamId",
        as: "homeTeam",
      });

      Match.belongsTo(models.Team, {
        foreignKey: "awayTeamId",
        as: "awayTeam",
      });

      Match.belongsTo(models.Venue, {
        foreignKey: "venueId",
        as: "venue",
      });

      Match.belongsTo(models.User, {
        foreignKey: "delegatedBy",
        as: "delegate",
      });

      Match.hasMany(models.MatchReferee, {
        foreignKey: "matchId",
        as: "refereeAssignments",
      });
    }
  }

  Match.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      competitionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "competition_id",
      },
      homeTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "home_team_id",
      },
      awayTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "away_team_id",
      },
      venueId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "venue_id",
      },
      round: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      matchNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "match_number",
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "scheduled_at",
      },
      status: {
        type: DataTypes.ENUM("scheduled", "in_progress", "completed", "postponed", "cancelled"),
        allowNull: false,
        defaultValue: "scheduled",
      },
      homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "home_score",
      },
      awayScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "away_score",
      },
      delegatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "delegated_by",
      },
      delegatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "delegated_at",
      },
      delegationStatus: {
        type: DataTypes.ENUM("pending", "partial", "complete", "confirmed"),
        allowNull: false,
        defaultValue: "pending",
        field: "delegation_status",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Match",
      tableName: "matches",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Match;
};

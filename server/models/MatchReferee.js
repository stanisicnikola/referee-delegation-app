"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MatchReferee extends Model {
    static associate(models) {
      MatchReferee.belongsTo(models.Match, {
        foreignKey: "matchId",
        as: "match",
      });

      MatchReferee.belongsTo(models.Referee, {
        foreignKey: "refereeId",
        as: "referee",
      });
    }
  }

  MatchReferee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      matchId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "match_id",
      },
      refereeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "referee_id",
      },
      role: {
        type: DataTypes.ENUM("first_referee", "second_referee", "third_referee"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "declined"),
        allowNull: false,
        defaultValue: "pending",
      },
      responseAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "response_at",
      },
      declineReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "decline_reason",
      },
      fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      travelCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "travel_cost",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "MatchReferee",
      tableName: "match_referees",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return MatchReferee;
};

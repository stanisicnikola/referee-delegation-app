"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Competition extends Model {
    static associate(models) {
      Competition.hasMany(models.Match, {
        foreignKey: "competitionId",
        as: "matches",
      });
    }
  }

  Competition.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      shortName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "short_name",
      },
      season: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM("seniors", "u19", "u17", "u15", "u13"),
        allowNull: false,
        defaultValue: "seniors",
      },
      gender: {
        type: DataTypes.ENUM("male", "female"),
        allowNull: false,
        defaultValue: "male",
      },
      status: {
        type: DataTypes.ENUM("upcoming", "active", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "active",
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "end_date",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Competition",
      tableName: "competitions",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Competition;
};

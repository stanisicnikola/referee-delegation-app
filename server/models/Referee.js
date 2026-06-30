"use strict";
const { Model } = require("sequelize");
const { REFEREE_CATEGORY_VALUES } = require("../constants/refereeCategories");

module.exports = (sequelize, DataTypes) => {
  class Referee extends Model {
    static associate(models) {
      Referee.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      Referee.hasMany(models.MatchReferee, {
        foreignKey: "refereeId",
        as: "matchAssignments",
      });

      Referee.hasMany(models.RefereeAvailability, {
        foreignKey: "refereeId",
        as: "availability",
      });
    }
  }

  Referee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: "user_id",
      },
      licenseCategory: {
        type: DataTypes.ENUM(...REFEREE_CATEGORY_VALUES),
        allowNull: false,
        defaultValue: "none",
        field: "license_category",
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth",
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bankAccount: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "bank_account",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Referee",
      tableName: "referees",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return Referee;
};

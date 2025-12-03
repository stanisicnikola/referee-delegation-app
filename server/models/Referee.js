"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Referee extends Model {
    static associate(models) {
      // Referee belongs to user (1:1)
      Referee.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // Referee can be assigned to many matches
      Referee.hasMany(models.MatchReferee, {
        foreignKey: "refereeId",
        as: "matchAssignments",
      });

      // Referee has availability
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
      licenseNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "license_number",
      },
      licenseCategory: {
        type: DataTypes.ENUM("international", "A", "B", "C", "regional"),
        allowNull: false,
        field: "license_category",
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth",
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      experienceYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "experience_years",
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
    }
  );

  return Referee;
};

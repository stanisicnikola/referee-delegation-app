"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RefereeAvailability extends Model {
    static associate(models) {
      RefereeAvailability.belongsTo(models.Referee, {
        foreignKey: "refereeId",
        as: "referee",
      });
      RefereeAvailability.belongsTo(models.User, {
        foreignKey: "reviewedBy",
        as: "reviewer",
      });
    }
  }

  RefereeAvailability.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      refereeId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "referee_id",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_available",
      },
      reason: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approvalStatus: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "approved",
        field: "approval_status",
      },
      reviewedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "reviewed_by",
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "reviewed_at",
      },
    },
    {
      sequelize,
      modelName: "RefereeAvailability",
      tableName: "referee_availability",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return RefereeAvailability;
};

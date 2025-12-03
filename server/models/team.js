"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.belongsTo(models.Venue, {
        foreignKey: "primaryVenueId",
        as: "primaryVenue",
      });

      Team.hasMany(models.Match, {
        foreignKey: "homeTeamId",
        as: "homeMatches",
      });

      Team.hasMany(models.Match, {
        foreignKey: "awayTeamId",
        as: "awayMatches",
      });
    }
  }

  Team.init(
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
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      logoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "logo_url",
      },
      primaryVenueId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "primary_venue_id",
      },
      contactPerson: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: "contact_person",
      },
      contactEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "contact_email",
      },
      contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "contact_phone",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Team",
      tableName: "teams",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Team;
};

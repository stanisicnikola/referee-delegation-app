"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    static associate(models) {
      Venue.hasMany(models.Team, {
        foreignKey: "primaryVenueId",
        as: "teams",
      });

      Venue.hasMany(models.Match, {
        foreignKey: "venueId",
        as: "matches",
      });
    }
  }

  Venue.init(
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
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      googleMapsUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "google_maps_url",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Venue",
      tableName: "venues",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Venue;
};

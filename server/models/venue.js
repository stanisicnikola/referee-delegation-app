"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Dvorana može imati više timova
      Venue.hasMany(models.Team, {
        as: "teams",
        foreignKey: "venueId",
      });

      // Dvorana može imati više utakmica
      Venue.hasMany(models.Game, {
        as: "games",
        foreignKey: "venueId",
      });
    }
  }
  Venue.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      country: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "Venue",
    }
  );
  return Venue;
};

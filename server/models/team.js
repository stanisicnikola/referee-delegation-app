"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Team.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      country: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      logoPath: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: "Team",
    }
  );
  return Team;
};

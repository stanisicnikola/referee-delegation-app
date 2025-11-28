"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Utakmica ima domaći tim
      Game.belongsTo(models.Team, { as: "homeTeam", foreignKey: "homeTeamId" });

      // Utakmica ima gostujući tim
      Game.belongsTo(models.Team, { as: "awayTeam", foreignKey: "awayTeamId" });

      // Utakmica se igra u jednoj dvorani
      Game.belongsTo(models.Venue, { as: "venue", foreignKey: "venueId" });
    }
  }
  Game.init(
    {
      scheduledAt: { type: DataTypes.DATE, allowNull: false },
      homeTeamId: { type: DataTypes.INTEGER, allowNull: false },
      awayTeamId: { type: DataTypes.INTEGER, allowNull: false },
      venueId: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM("scheduled", "completed", "canceled"),
        defaultValue: "scheduled",
      },
    },
    {
      sequelize,
      modelName: "Game",
    }
  );
  return Game;
};

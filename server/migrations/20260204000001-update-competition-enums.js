"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("competitions", "category", {
      type: Sequelize.ENUM("seniors", "juniors", "youth"),
      allowNull: false,
      defaultValue: "seniors",
    });

    await queryInterface.changeColumn("competitions", "status", {
      type: Sequelize.ENUM("upcoming", "active", "completed", "suspended"),
      allowNull: false,
      defaultValue: "active",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("competitions", "status", {
      type: Sequelize.ENUM("upcoming", "active", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    });

    await queryInterface.changeColumn("competitions", "category", {
      type: Sequelize.ENUM("seniors", "u19", "u17", "u15", "u13"),
      allowNull: false,
      defaultValue: "seniors",
    });
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update category ENUM
    await queryInterface.changeColumn("competitions", "category", {
      type: Sequelize.ENUM("seniors", "juniors", "youth"),
      allowNull: false,
      defaultValue: "seniors",
    });

    // Update status ENUM
    await queryInterface.changeColumn("competitions", "status", {
      type: Sequelize.ENUM("upcoming", "active", "completed", "suspended"),
      allowNull: false,
      defaultValue: "active",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert status ENUM
    await queryInterface.changeColumn("competitions", "status", {
      type: Sequelize.ENUM("upcoming", "active", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "active",
    });

    // Revert category ENUM
    await queryInterface.changeColumn("competitions", "category", {
      type: Sequelize.ENUM("seniors", "u19", "u17", "u15", "u13"),
      allowNull: false,
      defaultValue: "seniors",
    });
  },
};

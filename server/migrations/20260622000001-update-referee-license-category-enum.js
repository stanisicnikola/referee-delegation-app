"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("referees", "license_category", {
      type: Sequelize.ENUM("black", "green", "white", "none"),
      allowNull: false,
      defaultValue: "none",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("referees", "license_category", {
      type: Sequelize.ENUM("international", "A", "B", "C", "regional"),
      allowNull: false,
    });
  },
};

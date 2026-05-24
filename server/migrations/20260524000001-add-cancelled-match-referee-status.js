"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("match_referees", "status", {
      type: Sequelize.ENUM("pending", "accepted", "declined", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE match_referees SET status = 'declined' WHERE status = 'cancelled'"
    );

    await queryInterface.changeColumn("match_referees", "status", {
      type: Sequelize.ENUM("pending", "accepted", "declined"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};

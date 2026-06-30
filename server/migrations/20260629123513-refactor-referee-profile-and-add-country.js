"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("referees", "country", {
      type: Sequelize.STRING(100),
      allowNull: false,
      after: "date_of_birth",
    });

    await queryInterface.addColumn("teams", "country", {
      type: Sequelize.STRING(100),
      allowNull: false,
      after: "city",
    });

    await queryInterface.addColumn("venues", "country", {
      type: Sequelize.STRING(100),
      allowNull: false,
      after: "city",
    });

    await queryInterface.removeIndex("referees", "idx_referees_city");
    await queryInterface.removeColumn("referees", "license_number");
    await queryInterface.removeColumn("referees", "city");
    await queryInterface.removeColumn("referees", "experience_years");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("referees", "license_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: "user_id",
    });

    await queryInterface.addColumn("referees", "city", {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: "date_of_birth",
    });

    await queryInterface.addColumn("referees", "experience_years", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      after: "address",
    });

    await queryInterface.addIndex("referees", ["city"], {
      name: "idx_referees_city",
    });

    await queryInterface.removeColumn("venues", "country");
    await queryInterface.removeColumn("teams", "country");
    await queryInterface.removeColumn("referees", "country");
  },
};

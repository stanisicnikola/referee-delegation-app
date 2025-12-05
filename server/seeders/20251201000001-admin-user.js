"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 12);

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        email: "admin@referee.ba",
        password_hash: hashedPassword,
        first_name: "Admin",
        last_name: "Admin",
        role: "admin",
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", { email: "admin@referee.ba" }, {});
  },
};

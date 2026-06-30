"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(process.env.SEED_PASSWORD, 12);

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        email: "nikolastanisic113@gmail.com",
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
    await queryInterface.bulkDelete(
      "users",
      { email: "nikolastanisic113@gmail.com" },
      {},
    );
  },
};

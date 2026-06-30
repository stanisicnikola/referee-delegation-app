"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const EMAIL_PREFIX = "nikolastanisic113";

const DELEGATES = [
  { firstName: "Panagiotis", lastName: "Bakalis", phone: "+387600000001" },
  { firstName: "Romualdas", lastName: "Brazauskas", phone: "+387600000002" },
  { firstName: "Christos", lastName: "Christodoulou", phone: "+387600000003" },
  { firstName: "Eduardo", lastName: "De Sancha", phone: "+387600000004" },
  { firstName: "Antonio", lastName: "Gallo", phone: "+387600000005" },
  { firstName: "Marco", lastName: "Giansanti", phone: "+387600000006" },
];

const getSeedPassword = () => {
  const password = process.env.SEED_PASSWORD;

  if (!password) {
    throw new Error("Set SEED_PASSWORD before running demo user seeders.");
  }

  return password;
};

const getAliasEmail = (number) => `${EMAIL_PREFIX}+${number}@gmail.com`;

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash(getSeedPassword(), 12);

    await queryInterface.bulkInsert(
      "users",
      DELEGATES.map((delegate, index) => ({
        id: uuidv4(),
        email: getAliasEmail(index + 1),
        password_hash: passwordHash,
        must_change_password: false,
        first_name: delegate.firstName,
        last_name: delegate.lastName,
        phone: delegate.phone,
        role: "delegate",
        status: "active",
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "users",
      {
        email: {
          [Sequelize.Op.in]: DELEGATES.map((_, index) =>
            getAliasEmail(index + 1),
          ),
        },
      },
      {},
    );
  },
};

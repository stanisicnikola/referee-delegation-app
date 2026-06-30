"use strict";

const { v4: uuidv4 } = require("uuid");

const COMPETITION = {
  name: "EuroLeague",
  shortName: "EL",
  season: "2026/2027",
  category: "seniors",
  gender: "male",
  status: "upcoming",
  startDate: "2026-06-30",
  endDate: "2027-05-24",
  description: "Seeded 2026/2027 EuroLeague competition.",
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("competitions", [
      {
        id: uuidv4(),
        name: COMPETITION.name,
        short_name: COMPETITION.shortName,
        season: COMPETITION.season,
        category: COMPETITION.category,
        gender: COMPETITION.gender,
        status: COMPETITION.status,
        start_date: COMPETITION.startDate,
        end_date: COMPETITION.endDate,
        description: COMPETITION.description,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "competitions",
      {
        name: COMPETITION.name,
        season: COMPETITION.season,
      },
      {},
    );
  },
};

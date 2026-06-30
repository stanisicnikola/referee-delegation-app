"use strict";

const { v4: uuidv4 } = require("uuid");

const TEAMS = [
  {
    name: "Anadolu Efes Istanbul",
    shortName: "ANA",
    city: "Istanbul",
    country: "Turkey",
    venueName: "Turkcell Basketball Development Center",
  },
  {
    name: "Besiktas Istanbul",
    shortName: "BES",
    city: "Istanbul",
    country: "Turkey",
    venueName: "BJK Akatlar Arena",
  },
  {
    name: "Crvena Zvezda Meridianbet Belgrade",
    shortName: "CZV",
    city: "Belgrade",
    country: "Serbia",
    venueName: "Belgrade Arena",
  },
  {
    name: "Dubai Basketball",
    shortName: "DUB",
    city: "Dubai",
    country: "United Arab Emirates",
    venueName: "Coca-Cola Arena",
  },
  {
    name: "EA7 Emporio Armani Milan",
    shortName: "MIL",
    city: "Milan",
    country: "Italy",
    venueName: "Unipol Forum",
  },
  {
    name: "FC Barcelona",
    shortName: "BAR",
    city: "Barcelona",
    country: "Spain",
    venueName: "Palau Blaugrana",
  },
  {
    name: "FC Bayern Munich",
    shortName: "BAY",
    city: "Munich",
    country: "Germany",
    venueName: "SAP Garden",
  },
  {
    name: "Fenerbahce Beko Istanbul",
    shortName: "FEN",
    city: "Istanbul",
    country: "Turkey",
    venueName: "Ulker Sports and Event Hall",
  },
  {
    name: "Hapoel IBI Tel Aviv",
    shortName: "HTA",
    city: "Tel Aviv",
    country: "Israel",
    venueName: "Shlomo Group Arena",
  },
  {
    name: "Baskonia Vitoria-Gasteiz",
    shortName: "BAS",
    city: "Vitoria-Gasteiz",
    country: "Spain",
    venueName: "Buesa Arena",
  },
  {
    name: "ASVEL LDLC Villeurbanne",
    shortName: "ASV",
    city: "Villeurbanne",
    country: "France",
    venueName: "LDLC Arena",
  },
  {
    name: "Maccabi Playtika Tel Aviv",
    shortName: "MTA",
    city: "Tel Aviv",
    country: "Israel",
    venueName: "Menora Mivtachim Arena",
  },
  {
    name: "Olympiacos Piraeus",
    shortName: "OLY",
    city: "Piraeus",
    country: "Greece",
    venueName: "Peace and Friendship Stadium",
  },
  {
    name: "Panathinaikos AKTOR Athens",
    shortName: "PAN",
    city: "Athens",
    country: "Greece",
    venueName: "Telekom Center Athens",
  },
  {
    name: "Paris Basketball",
    shortName: "PAR",
    city: "Paris",
    country: "France",
    venueName: "Adidas Arena",
  },
  {
    name: "Partizan Mozzart Bet Belgrade",
    shortName: "PTZ",
    city: "Belgrade",
    country: "Serbia",
    venueName: "Belgrade Arena",
  },
  {
    name: "Real Madrid",
    shortName: "RMA",
    city: "Madrid",
    country: "Spain",
    venueName: "Movistar Arena",
  },
  {
    name: "Valencia Basket",
    shortName: "VAL",
    city: "Valencia",
    country: "Spain",
    venueName: "Roig Arena",
  },
  {
    name: "Virtus Segafredo Bologna",
    shortName: "VIR",
    city: "Bologna",
    country: "Italy",
    venueName: "Virtus Arena",
  },
  {
    name: "Zalgiris Kaunas",
    shortName: "ZAL",
    city: "Kaunas",
    country: "Lithuania",
    venueName: "Zalgirio Arena",
  },
];

const getVenueIdsByName = async (queryInterface, Sequelize) => {
  const venueNames = [...new Set(TEAMS.map((team) => team.venueName))];
  const venues = await queryInterface.sequelize.query(
    "SELECT id, name FROM venues WHERE name IN (:venueNames)",
    {
      replacements: { venueNames },
      type: Sequelize.QueryTypes.SELECT,
    },
  );

  return new Map(venues.map((venue) => [venue.name, venue.id]));
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const venueIdsByName = await getVenueIdsByName(queryInterface, Sequelize);
    const missingVenues = [
      ...new Set(TEAMS.map((team) => team.venueName)),
    ].filter((venueName) => !venueIdsByName.has(venueName));

    if (missingVenues.length > 0) {
      throw new Error(
        `Missing EuroLeague venues for team seed: ${missingVenues.join(", ")}`,
      );
    }

    await queryInterface.bulkInsert(
      "teams",
      TEAMS.map(({ venueName, shortName, ...team }) => ({
        id: uuidv4(),
        ...team,
        short_name: shortName,
        primary_venue_id: venueIdsByName.get(venueName),
        status: "active",
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "teams",
      {
        name: {
          [Sequelize.Op.in]: TEAMS.map((team) => team.name),
        },
      },
      {},
    );
  },
};

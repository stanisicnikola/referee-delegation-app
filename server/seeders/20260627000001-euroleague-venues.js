"use strict";

const { v4: uuidv4 } = require("uuid");

const VENUES = [
  {
    name: "Turkcell Basketball Development Center",
    address: "Ataturk Olympic Park, Basaksehir",
    city: "Istanbul",
    country: "Turkey",
    capacity: 10000,
  },
  {
    name: "BJK Akatlar Arena",
    address: "Akat Mahallesi, Açelya Sokak 2",
    city: "Istanbul",
    country: "Turkey",
    capacity: 3200,
  },
  {
    name: "Belgrade Arena",
    address: "Bulevar Arsenija Carnojevica 58",
    city: "Belgrade",
    country: "Serbia",
    capacity: 21000,
  },
  {
    name: "Coca-Cola Arena",
    address: "City Walk, Al Safa Street",
    city: "Dubai",
    country: "United Arab Emirates",
    capacity: 13221,
  },
  {
    name: "Unipol Forum",
    address: "Via Giuseppe di Vittorio 6",
    city: "Assago",
    country: "Italy",
    capacity: 11200,
  },
  {
    name: "Palau Blaugrana",
    address: "Carrer d'Aristides Maillol 12",
    city: "Barcelona",
    country: "Spain",
    capacity: 7585,
  },
  {
    name: "SAP Garden",
    address: "Toni-Merkens-Weg 4",
    city: "Munich",
    country: "Germany",
    capacity: 11500,
  },
  {
    name: "Ulker Sports and Event Hall",
    address: "Zuhupasa, Recep Peker Caddesi No:21",
    city: "Istanbul",
    country: "Turkey",
    capacity: 13000,
  },
  {
    name: "Menora Mivtachim Arena",
    address: "Yigal Alon Street 51",
    city: "Tel Aviv",
    country: "Israel",
    capacity: 10383,
  },
  {
    name: "Shlomo Group Arena",
    address: "Shitrit Street 2",
    city: "Tel Aviv",
    country: "Israel",
    capacity: 3500,
  },
  {
    name: "Buesa Arena",
    address: "Carretera Zurbano s/n",
    city: "Vitoria-Gasteiz",
    country: "Spain",
    capacity: 15431,
  },
  {
    name: "LDLC Arena",
    address: "5 Avenue Simone Veil",
    city: "Decines-Charpieu",
    country: "France",
    capacity: 12523,
  },
  {
    name: "Peace and Friendship Stadium",
    address: "Ethnarchou Makariou",
    city: "Piraeus",
    country: "Greece",
    capacity: 12930,
  },
  {
    name: "Telekom Center Athens",
    address: "37 Kifisias Avenue, Marousi",
    city: "Athens",
    country: "Greece",
    capacity: 19250,
  },
  {
    name: "Adidas Arena",
    address: "56 Boulevard Ney",
    city: "Paris",
    country: "France",
    capacity: 8000,
  },
  {
    name: "Movistar Arena",
    address: "Avenida de Felipe II",
    city: "Madrid",
    country: "Spain",
    capacity: 15000,
  },
  {
    name: "Roig Arena",
    address: "Carrer d'Angel Villena",
    city: "Valencia",
    country: "Spain",
    capacity: 15600,
  },
  {
    name: "Virtus Arena",
    address: "Piazza della Costituzione 5",
    city: "Bologna",
    country: "Italy",
    capacity: 10500,
  },
  {
    name: "Zalgirio Arena",
    address: "Karaliaus Mindaugo prospektas 50",
    city: "Kaunas",
    country: "Lithuania",
    capacity: 15415,
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "venues",
      VENUES.map((venue) => ({
        id: uuidv4(),
        ...venue,
        created_at: now,
        updated_at: now,
      })),
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "venues",
      {
        name: {
          [Sequelize.Op.in]: VENUES.map((venue) => venue.name),
        },
      },
      {},
    );
  },
};

"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const EMAIL_PREFIX = "nikolastanisic113";
const FIRST_REFEREE_EMAIL_NUMBER = 7;

const REFEREES = [
  { firstName: "Jordi", lastName: "Aliaga", country: "Spain" },
  { firstName: "Manuel", lastName: "Attard", country: "Malta" },
  { firstName: "Alberto", lastName: "Baena", country: "Spain" },
  { firstName: "Kerem", lastName: "Baki", country: "Turkey" },
  { firstName: "Amit", lastName: "Balak", country: "Israel" },
  { firstName: "Ilija", lastName: "Belosevic", country: "Serbia" },
  { firstName: "Joseph", lastName: "Bissang", country: "France" },
  { firstName: "Thomas", lastName: "Bissuel", country: "France" },
  { firstName: "Steve", lastName: "Bittner", country: "Germany" },
  { firstName: "Maxime", lastName: "Boubert", country: "France" },
  { firstName: "Stefan", lastName: "Calic", country: "Serbia" },
  { firstName: "Huseyin", lastName: "Celik", country: "Turkey" },
  { firstName: "Gentian", lastName: "Cici", country: "Albania" },
  { firstName: "Carlos", lastName: "Cortes", country: "Spain" },
  { firstName: "Mehdi", lastName: "Difallah", country: "France" },
  { firstName: "Igor", lastName: "Dragojevic", country: "Montenegro" },
  { firstName: "Ioannis", lastName: "Foufis", country: "Greece" },
  {
    firstName: "Juan Carlos",
    lastName: "Garcia Gonzalez",
    country: "Spain",
  },
  { firstName: "Guido", lastName: "Giovannetti", country: "Italy" },
  { firstName: "Noam", lastName: "Gordon", country: "Israel" },
  { firstName: "Franko", lastName: "Gracin", country: "Croatia" },
  {
    firstName: "Denis",
    lastName: "Hadzic",
    country: "Bosnia and Herzegovina",
  },
  { firstName: "Tomislav", lastName: "Hordov", country: "Croatia" },
  { firstName: "Damir", lastName: "Javor", country: "Slovenia" },
  { firstName: "Milivoje", lastName: "Jovcic", country: "Serbia" },
  { firstName: "Marko", lastName: "Juras", country: "Serbia" },
  { firstName: "Luka", lastName: "Kardum", country: "Croatia" },
  { firstName: "Milos", lastName: "Koljensic", country: "Montenegro" },
  { firstName: "Kristaps", lastName: "Konstantinovs", country: "Latvia" },
  { firstName: "Marcin", lastName: "Kowalski", country: "Poland" },
  { firstName: "Olegs", lastName: "Latisevs", country: "Latvia" },
  { firstName: "Leandro", lastName: "Lezcano", country: "Argentina" },
  { firstName: "Robert", lastName: "Lottermoser", country: "Germany" },
  { firstName: "Mario", lastName: "Majkic", country: "Slovenia" },
  { firstName: "Sergio", lastName: "Manuel", country: "Portugal" },
  { firstName: "Can", lastName: "Mavisu", country: "Turkey" },
  { firstName: "Emin", lastName: "Mogulkoc", country: "Turkey" },
  { firstName: "Milan", lastName: "Nedovic", country: "Slovenia" },
  { firstName: "Uros", lastName: "Nikolic", country: "Serbia" },
  { firstName: "Uros", lastName: "Obrknezevic", country: "Serbia" },
  { firstName: "Arnau", lastName: "Padros", country: "Spain" },
  { firstName: "Anne", lastName: "Panther", country: "Germany" },
  { firstName: "Piotr", lastName: "Pastusiak", country: "Poland" },
  { firstName: "Adar", lastName: "Peer", country: "Israel" },
  { firstName: "Rain", lastName: "Peerandi", country: "Estonia" },
  { firstName: "Miguel Angel", lastName: "Perez Perez", country: "Spain" },
  { firstName: "Emilio", lastName: "Perez Pizarro", country: "Spain" },
  { firstName: "Carlos", lastName: "Peruga", country: "Spain" },
  { firstName: "Saso", lastName: "Petek", country: "Slovenia" },
  { firstName: "Vassilis", lastName: "Pitsilkas", country: "Greece" },
  {
    firstName: "Dragan",
    lastName: "Porobic",
    country: "Bosnia and Herzegovina",
  },
  { firstName: "Sasa", lastName: "Pukl", country: "Slovenia" },
  { firstName: "Saulius", lastName: "Racys", country: "Lithuania" },
  { firstName: "Josip", lastName: "Radojkovic", country: "Croatia" },
  { firstName: "Sreten", lastName: "Radovic", country: "Croatia" },
  { firstName: "Michele", lastName: "Rossi", country: "Italy" },
  { firstName: "Boris", lastName: "Ryzhyk", country: "Ukraine" },
  { firstName: "Seffi", lastName: "Shemesh", country: "Israel" },
  { firstName: "Sergio", lastName: "Silva", country: "Portugal" },
  { firstName: "Arturas", lastName: "Sukys", country: "Lithuania" },
  { firstName: "Christian", lastName: "Theis", country: "Germany" },
  { firstName: "Hugues", lastName: "Thepenier", country: "France" },
  { firstName: "Ioannis", lastName: "Tiganis", country: "Greece" },
  { firstName: "Tomasz", lastName: "Trawicki", country: "Poland" },
  { firstName: "Vasiliki", lastName: "Tsaroucha", country: "Greece" },
  { firstName: "Eduard", lastName: "Udyanskyy", country: "Ukraine" },
  { firstName: "Nick", lastName: "Van Den Broeck", country: "Belgium" },
  { firstName: "Gytis", lastName: "Vilius", country: "Lithuania" },
  { firstName: "Robert", lastName: "Vyklicky", country: "Czech Republic" },
  { firstName: "Jakub", lastName: "Zamojski", country: "Poland" },
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
    const users = REFEREES.map((referee, index) => ({
      id: uuidv4(),
      email: getAliasEmail(FIRST_REFEREE_EMAIL_NUMBER + index),
      password_hash: passwordHash,
      must_change_password: false,
      first_name: referee.firstName,
      last_name: referee.lastName,
      phone: null,
      role: "referee",
      status: "active",
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("users", users);

    await queryInterface.bulkInsert(
      "referees",
      users.map((user, index) => ({
        id: uuidv4(),
        user_id: user.id,
        license_category: "black",
        date_of_birth: null,
        country: REFEREES[index].country,
        address: null,
        bank_account: null,
        notes: "Official EuroLeague referee.",
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
          [Sequelize.Op.in]: REFEREES.map((_, index) =>
            getAliasEmail(FIRST_REFEREE_EMAIL_NUMBER + index),
          ),
        },
      },
      {},
    );
  },
};

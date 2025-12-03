const authRoutes = require("./auth");
const userRoutes = require("./users");
const refereeRoutes = require("./referees");
const teamRoutes = require("./teams");
const venueRoutes = require("./venues");
const competitionRoutes = require("./competitions");
const matchRoutes = require("./matches");
const delegationRoutes = require("./delegations");
const availabilityRoutes = require("./availability");

module.exports = {
  authRoutes,
  userRoutes,
  refereeRoutes,
  teamRoutes,
  venueRoutes,
  competitionRoutes,
  matchRoutes,
  delegationRoutes,
  availabilityRoutes,
};

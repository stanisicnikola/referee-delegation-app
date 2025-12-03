const authValidators = require("./auth");
const userValidators = require("./user");
const refereeValidators = require("./referee");
const teamValidators = require("./team");
const venueValidators = require("./venue");
const competitionValidators = require("./competition");
const matchValidators = require("./match");
const delegationValidators = require("./delegation");
const availabilityValidators = require("./availability");

module.exports = {
  authSchemas: authValidators,
  userSchemas: userValidators,
  refereeSchemas: refereeValidators,
  teamSchemas: teamValidators,
  venueSchemas: venueValidators,
  competitionSchemas: competitionValidators,
  matchSchemas: matchValidators,
  delegationSchemas: delegationValidators,
  availabilitySchemas: availabilityValidators,
};

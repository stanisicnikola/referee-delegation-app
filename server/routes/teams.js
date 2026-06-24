const express = require("express");
const router = express.Router();
const { teamController } = require("../controllers");
const {
  authenticate,
  authorize,
  validate,
  uploadTeamLogo,
} = require("../middlewares");
const { teamSchemas } = require("../validators");

router.use(authenticate);

router.get("/stats", teamController.getTeamStats);

router.get("/", validate(teamSchemas.query, "query"), teamController.getTeams);
router.get(
  "/:id",
  validate(teamSchemas.params, "params"),
  teamController.getTeam,
);

router.post(
  "/",
  authorize("admin", "delegate"),
  validate(teamSchemas.create),
  teamController.createTeam,
);
router.put(
  "/:id",
  authorize("admin", "delegate"),
  validate(teamSchemas.params, "params"),
  validate(teamSchemas.update),
  teamController.updateTeam,
);
router.delete(
  "/:id",
  authorize("admin", "delegate"),
  validate(teamSchemas.params, "params"),
  teamController.deleteTeam,
);

router.put(
  "/:id/logo",
  authorize("admin", "delegate"),
  validate(teamSchemas.params, "params"),
  uploadTeamLogo,
  teamController.uploadLogo,
);

module.exports = router;

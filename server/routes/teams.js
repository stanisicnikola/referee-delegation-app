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

// All routes require authentication
router.use(authenticate);

// CRUD operacije
router.get("/", validate(teamSchemas.query, "query"), teamController.getTeams);
router.get(
  "/:id",
  validate(teamSchemas.params, "params"),
  teamController.getTeam
);

// Admin only
router.post(
  "/",
  authorize("admin"),
  validate(teamSchemas.create),
  teamController.createTeam
);
router.put(
  "/:id",
  authorize("admin"),
  validate(teamSchemas.params, "params"),
  validate(teamSchemas.update),
  teamController.updateTeam
);
router.delete(
  "/:id",
  authorize("admin"),
  validate(teamSchemas.params, "params"),
  teamController.deleteTeam
);

// Upload logo
router.put(
  "/:id/logo",
  authorize("admin"),
  validate(teamSchemas.params, "params"),
  uploadTeamLogo,
  teamController.uploadLogo
);

module.exports = router;

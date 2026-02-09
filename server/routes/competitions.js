const express = require("express");
const router = express.Router();
const { competitionController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { competitionSchemas } = require("../validators");

// All routes require authentication
router.use(authenticate);

// Seasons (must be before /:id)
router.get("/seasons", competitionController.getSeasons);

// Summary (must be before /:id)
router.get("/summary", competitionController.getCompetitionSummary);

// CRUD operacije
router.get(
  "/",
  validate(competitionSchemas.query, "query"),
  competitionController.getCompetitions,
);
router.get(
  "/:id",
  validate(competitionSchemas.params, "params"),
  competitionController.getCompetition,
);

// Admin only
router.post(
  "/",
  authorize("admin"),
  validate(competitionSchemas.create),
  competitionController.createCompetition,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(competitionSchemas.params, "params"),
  validate(competitionSchemas.update),
  competitionController.updateCompetition,
);
router.delete(
  "/:id",
  authorize("admin"),
  validate(competitionSchemas.params, "params"),
  competitionController.deleteCompetition,
);

// Competition statistics
router.get(
  "/:id/statistics",
  validate(competitionSchemas.params, "params"),
  competitionController.getCompetitionStatistics,
);

module.exports = router;

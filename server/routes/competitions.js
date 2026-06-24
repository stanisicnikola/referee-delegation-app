const express = require("express");
const router = express.Router();
const { competitionController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { competitionSchemas } = require("../validators");

router.use(authenticate);

router.get("/seasons", competitionController.getSeasons);

router.get("/summary", competitionController.getCompetitionSummary);

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

router.post(
  "/",
  authorize("admin", "delegate"),
  validate(competitionSchemas.create),
  competitionController.createCompetition,
);
router.put(
  "/:id",
  authorize("admin", "delegate"),
  validate(competitionSchemas.params, "params"),
  validate(competitionSchemas.update),
  competitionController.updateCompetition,
);
router.delete(
  "/:id",
  authorize("admin", "delegate"),
  validate(competitionSchemas.params, "params"),
  competitionController.deleteCompetition,
);

router.get(
  "/:id/statistics",
  validate(competitionSchemas.params, "params"),
  competitionController.getCompetitionStatistics,
);

module.exports = router;

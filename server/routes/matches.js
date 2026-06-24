const express = require("express");
const router = express.Router();
const { matchController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { matchSchemas } = require("../validators");

router.use(authenticate);

router.get("/upcoming", matchController.getUpcomingMatches);
router.get(
  "/pending-delegation",
  authorize("admin", "delegate"),
  matchController.getPendingDelegation,
);
router.get(
  "/statistics",
  authorize("admin"),
  matchController.getMatchStatistics,
);

router.get(
  "/",
  validate(matchSchemas.query, "query"),
  matchController.getMatches,
);
router.get(
  "/:id",
  validate(matchSchemas.params, "params"),
  matchController.getMatch,
);

router.post(
  "/",
  authorize("admin", "delegate"),
  validate(matchSchemas.create),
  matchController.createMatch,
);
router.put(
  "/:id",
  authorize("admin", "delegate"),
  validate(matchSchemas.params, "params"),
  validate(matchSchemas.update),
  matchController.updateMatch,
);
router.delete(
  "/:id",
  authorize("admin", "delegate"),
  validate(matchSchemas.params, "params"),
  matchController.deleteMatch,
);

router.put(
  "/:id/result",
  authorize("admin", "delegate"),
  validate(matchSchemas.params, "params"),
  validate(matchSchemas.updateResult),
  matchController.updateResult,
);

module.exports = router;

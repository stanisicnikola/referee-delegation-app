const express = require("express");
const router = express.Router();
const { matchController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { matchSchemas } = require("../validators");

// All routes require authentication
router.use(authenticate);

// Special routes (must be before /:id)
router.get("/upcoming", matchController.getUpcomingMatches);
router.get(
  "/pending-delegation",
  authorize("admin", "delegate"),
  matchController.getPendingDelegation
);
router.get(
  "/statistics",
  authorize("admin"),
  matchController.getMatchStatistics
);

// CRUD operacije
router.get(
  "/",
  validate(matchSchemas.query, "query"),
  matchController.getMatches
);
router.get(
  "/:id",
  validate(matchSchemas.params, "params"),
  matchController.getMatch
);

// Admin only
router.post(
  "/",
  authorize("admin"),
  validate(matchSchemas.create),
  matchController.createMatch
);
router.put(
  "/:id",
  authorize("admin"),
  validate(matchSchemas.params, "params"),
  validate(matchSchemas.update),
  matchController.updateMatch
);
router.delete(
  "/:id",
  authorize("admin"),
  validate(matchSchemas.params, "params"),
  matchController.deleteMatch
);

// Update result
router.put(
  "/:id/result",
  authorize("admin"),
  validate(matchSchemas.params, "params"),
  validate(matchSchemas.updateResult),
  matchController.updateResult
);

module.exports = router;

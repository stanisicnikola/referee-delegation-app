const express = require("express");
const router = express.Router();
const { refereeController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { refereeSchemas } = require("../validators");

// All routes require authentication
router.use(authenticate);

// Routes for logged-in referee (must be before /:id)
router.get(
  "/my-assignments",
  authorize("referee"),
  refereeController.getMyAssignments,
);
router.get(
  "/my-statistics",
  authorize("referee"),
  refereeController.getMyStatistics,
);

// Get available referees for date
router.get(
  "/available",
  authorize("admin", "delegate"),
  validate(refereeSchemas.availableQuery, "query"),
  refereeController.getAvailableReferees,
);

// Overall statistics
router.get(
  "/statistics",
  authorize("admin", "delegate"),
  refereeController.getRefereesStatistics,
);

// CRUD operacije
router.get(
  "/",
  validate(refereeSchemas.query, "query"),
  refereeController.getReferees,
);
router.get(
  "/:id",
  validate(refereeSchemas.params, "params"),
  refereeController.getReferee,
);

// Admin only
router.post(
  "/",
  authorize("admin"),
  validate(refereeSchemas.create),
  refereeController.createReferee,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(refereeSchemas.params, "params"),
  validate(refereeSchemas.update),
  refereeController.updateReferee,
);
router.delete(
  "/:id",
  authorize("admin"),
  validate(refereeSchemas.params, "params"),
  refereeController.deleteReferee,
);

// Referee delegations and statistics
router.get(
  "/:id/assignments",
  validate(refereeSchemas.params, "params"),
  refereeController.getRefereeAssignments,
);
router.get(
  "/:id/statistics",
  validate(refereeSchemas.params, "params"),
  refereeController.getRefereeStatistics,
);

module.exports = router;

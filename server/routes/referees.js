const express = require("express");
const router = express.Router();
const { refereeController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { refereeSchemas } = require("../validators");

router.use(authenticate);

router.get(
  "/my-dashboard",
  authorize("referee"),
  validate(refereeSchemas.dashboardQuery, "query"),
  refereeController.getMyDashboard,
);
router.get(
  "/my-assignments",
  authorize("referee"),
  refereeController.getMyAssignments,
);
router.get(
  "/my-pending",
  authorize("referee"),
  refereeController.getMyPendingAssignments,
);
router.get(
  "/my-history",
  authorize("referee"),
  validate(refereeSchemas.historyQuery, "query"),
  refereeController.getMyHistory,
);
router.get(
  "/my-history-statistics",
  authorize("referee"),
  refereeController.getMyHistoryStatistics,
);
router.get(
  "/my-statistics",
  authorize("referee"),
  refereeController.getMyStatistics,
);

router.get(
  "/available",
  authorize("admin", "delegate"),
  validate(refereeSchemas.availableQuery, "query"),
  refereeController.getAvailableReferees,
);

router.get(
  "/statistics",
  authorize("admin", "delegate"),
  refereeController.getRefereesStatistics,
);

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

router.post(
  "/",
  authorize("admin", "delegate"),
  validate(refereeSchemas.create),
  refereeController.createReferee,
);
router.put(
  "/:id",
  authorize("admin", "delegate"),
  validate(refereeSchemas.params, "params"),
  validate(refereeSchemas.update),
  refereeController.updateReferee,
);
router.delete(
  "/:id",
  authorize("admin", "delegate"),
  validate(refereeSchemas.params, "params"),
  refereeController.deleteReferee,
);

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

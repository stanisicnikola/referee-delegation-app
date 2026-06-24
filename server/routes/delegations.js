const express = require("express");
const router = express.Router();
const { delegationController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { delegationSchemas } = require("../validators");

router.use(authenticate);

router.get(
  "/statistics",
  authorize("admin", "delegate"),
  delegationController.getDelegationStatistics,
);

router.get(
  "/my-delegations",
  authorize("delegate"),
  delegationController.getMyDelegations,
);

router.get(
  "/delegate/dashboard",
  authorize("admin", "delegate"),
  delegationController.getDelegateDashboard,
);

router.post(
  "/matches/:matchId",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchParams, "params"),
  validate(delegationSchemas.delegate),
  delegationController.delegateReferees,
);

router.get(
  "/matches/:matchId",
  authorize("admin", "delegate", "referee"),
  validate(delegationSchemas.matchParams, "params"),
  delegationController.getMatchDelegation,
);

router.get(
  "/matches/:matchId/available-referees",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchParams, "params"),
  delegationController.getAvailableRefereesForMatch,
);

router.put(
  "/matches/:matchId/referees/:refereeId/role",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchRefereeParams, "params"),
  validate(delegationSchemas.updateRole),
  delegationController.updateRefereeRole,
);

router.delete(
  "/matches/:matchId/referees/:refereeId",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchRefereeParams, "params"),
  delegationController.removeRefereeFromMatch,
);

router.put(
  "/matches/:matchId/accept",
  authorize("referee"),
  validate(delegationSchemas.matchParams, "params"),
  delegationController.confirmAssignment,
);

router.put(
  "/matches/:matchId/confirm",
  authorize("referee"),
  validate(delegationSchemas.matchParams, "params"),
  delegationController.confirmAssignment,
);

router.put(
  "/matches/:matchId/reject",
  authorize("referee"),
  validate(delegationSchemas.matchParams, "params"),
  validate(delegationSchemas.reject),
  delegationController.rejectAssignment,
);

module.exports = router;

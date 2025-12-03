const express = require("express");
const router = express.Router();
const { delegationController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { delegationSchemas } = require("../validators");

// All routes require authentication
router.use(authenticate);

// Delegation statistics
router.get(
  "/statistics",
  authorize("admin", "delegate"),
  delegationController.getDelegationStatistics
);

// My delegations (for delegates)
router.get(
  "/my-delegations",
  authorize("delegate"),
  delegationController.getMyDelegations
);

// Delegate referees to match
router.post(
  "/matches/:matchId",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchParams, "params"),
  validate(delegationSchemas.delegate),
  delegationController.delegateReferees
);

// Get delegation for match
router.get(
  "/matches/:matchId",
  validate(delegationSchemas.matchParams, "params"),
  delegationController.getMatchDelegation
);

// Get available referees for match
router.get(
  "/matches/:matchId/available-referees",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchParams, "params"),
  delegationController.getAvailableRefereesForMatch
);

// Update referee role
router.put(
  "/matches/:matchId/referees/:refereeId/role",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchRefereeParams, "params"),
  validate(delegationSchemas.updateRole),
  delegationController.updateRefereeRole
);

// Remove referee from match
router.delete(
  "/matches/:matchId/referees/:refereeId",
  authorize("admin", "delegate"),
  validate(delegationSchemas.matchRefereeParams, "params"),
  delegationController.removeRefereeFromMatch
);

// Referee confirms/rejects delegation
router.put(
  "/matches/:matchId/confirm",
  authorize("referee"),
  validate(delegationSchemas.matchParams, "params"),
  delegationController.confirmAssignment
);

router.put(
  "/matches/:matchId/reject",
  authorize("referee"),
  validate(delegationSchemas.matchParams, "params"),
  validate(delegationSchemas.reject),
  delegationController.rejectAssignment
);

module.exports = router;

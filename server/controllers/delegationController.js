const { delegationService, refereeService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Delegate referees to a match
 * @route   POST /api/delegations/matches/:matchId
 * @access  Private/Admin,Delegate
 */
const delegateReferees = asyncHandler(async (req, res) => {
  const result = await delegationService.delegateReferees(
    req.params.matchId,
    req.body,
    req.user.id
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get delegation for a match
 * @route   GET /api/delegations/matches/:matchId
 * @access  Private
 */
const getMatchDelegation = asyncHandler(async (req, res) => {
  const delegation = await delegationService.getMatchDelegation(
    req.params.matchId
  );

  res.json({
    success: true,
    data: delegation,
  });
});

/**
 * @desc    Remove referee from match
 * @route   DELETE /api/delegations/matches/:matchId/referees/:refereeId
 * @access  Private/Admin,Delegate
 */
const removeRefereeFromMatch = asyncHandler(async (req, res) => {
  const result = await delegationService.removeRefereeFromMatch(
    req.params.matchId,
    req.params.refereeId
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get available referees for a match
 * @route   GET /api/delegations/matches/:matchId/available-referees
 * @access  Private/Admin,Delegate
 */
const getAvailableRefereesForMatch = asyncHandler(async (req, res) => {
  const referees = await delegationService.getAvailableRefereesForMatch(
    req.params.matchId
  );

  res.json({
    success: true,
    data: referees,
  });
});

/**
 * @desc    Update referee role on a match
 * @route   PUT /api/delegations/matches/:matchId/referees/:refereeId/role
 * @access  Private/Admin,Delegate
 */
const updateRefereeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const result = await delegationService.updateRefereeRole(
    req.params.matchId,
    req.params.refereeId,
    role
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get delegations by delegate
 * @route   GET /api/delegations/my-delegations
 * @access  Private/Delegate
 */
const getMyDelegations = asyncHandler(async (req, res) => {
  const result = await delegationService.getDelegationsByDelegate(
    req.user.id,
    req.query
  );

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get delegation statistics
 * @route   GET /api/delegations/statistics
 * @access  Private/Admin,Delegate
 */
const getDelegationStatistics = asyncHandler(async (req, res) => {
  const statistics = await delegationService.getDelegationStatistics();

  res.json({
    success: true,
    data: statistics,
  });
});

/**
 * @desc    Confirm assignment (referee confirms)
 * @route   PUT /api/delegations/matches/:matchId/confirm
 * @access  Private/Referee
 */
const confirmAssignment = asyncHandler(async (req, res) => {
  // Get referee for current user
  const referee = await refereeService.findByUserId(req.user.id);
  const result = await delegationService.confirmAssignment(
    req.params.matchId,
    referee.id
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Reject delegation (referee rejects)
 * @route   PUT /api/delegations/matches/:matchId/reject
 * @access  Private/Referee
 */
const rejectAssignment = asyncHandler(async (req, res) => {
  const referee = await refereeService.findByUserId(req.user.id);
  const { reason } = req.body;
  const result = await delegationService.rejectAssignment(
    req.params.matchId,
    referee.id,
    reason
  );

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  delegateReferees,
  getMatchDelegation,
  removeRefereeFromMatch,
  getAvailableRefereesForMatch,
  updateRefereeRole,
  getMyDelegations,
  getDelegationStatistics,
  confirmAssignment,
  rejectAssignment,
};

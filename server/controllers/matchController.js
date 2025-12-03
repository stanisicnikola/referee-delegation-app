const { matchService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get all matches
 * @route   GET /api/matches
 * @access  Private
 */
const getMatches = asyncHandler(async (req, res) => {
  const result = await matchService.findAll(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get match by ID
 * @route   GET /api/matches/:id
 * @access  Private
 */
const getMatch = asyncHandler(async (req, res) => {
  const match = await matchService.findById(req.params.id);

  res.json({
    success: true,
    data: match,
  });
});

/**
 * @desc    Create match
 * @route   POST /api/matches
 * @access  Private/Admin
 */
const createMatch = asyncHandler(async (req, res) => {
  const match = await matchService.create(req.body);

  res.status(201).json({
    success: true,
    data: match,
  });
});

/**
 * @desc    Update match
 * @route   PUT /api/matches/:id
 * @access  Private/Admin
 */
const updateMatch = asyncHandler(async (req, res) => {
  const match = await matchService.update(req.params.id, req.body);

  res.json({
    success: true,
    data: match,
  });
});

/**
 * @desc    Delete match
 * @route   DELETE /api/matches/:id
 * @access  Private/Admin
 */
const deleteMatch = asyncHandler(async (req, res) => {
  await matchService.delete(req.params.id);

  res.json({
    success: true,
    message: "Match deleted successfully.",
  });
});

/**
 * @desc    Update match result
 * @route   PUT /api/matches/:id/result
 * @access  Private/Admin
 */
const updateResult = asyncHandler(async (req, res) => {
  const match = await matchService.updateResult(req.params.id, req.body);

  res.json({
    success: true,
    data: match,
  });
});

/**
 * @desc    Get upcoming matches
 * @route   GET /api/matches/upcoming
 * @access  Private
 */
const getUpcomingMatches = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const matches = await matchService.getUpcoming(parseInt(limit));

  res.json({
    success: true,
    data: matches,
  });
});

/**
 * @desc    Get matches pending delegation
 * @route   GET /api/matches/pending-delegation
 * @access  Private/Admin,Delegate
 */
const getPendingDelegation = asyncHandler(async (req, res) => {
  const result = await matchService.getPendingDelegation(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get match statistics
 * @route   GET /api/matches/statistics
 * @access  Private/Admin
 */
const getMatchStatistics = asyncHandler(async (req, res) => {
  const statistics = await matchService.getStatistics();

  res.json({
    success: true,
    data: statistics,
  });
});

module.exports = {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  updateResult,
  getUpcomingMatches,
  getPendingDelegation,
  getMatchStatistics,
};

const { competitionService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get all competitions
 * @route   GET /api/competitions
 * @access  Private
 */
const getCompetitions = asyncHandler(async (req, res) => {
  const result = await competitionService.findAll(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get competition by ID
 * @route   GET /api/competitions/:id
 * @access  Private
 */
const getCompetition = asyncHandler(async (req, res) => {
  const competition = await competitionService.findById(req.params.id);

  res.json({
    success: true,
    data: competition,
  });
});

/**
 * @desc    Create competition
 * @route   POST /api/competitions
 * @access  Private/Admin
 */
const createCompetition = asyncHandler(async (req, res) => {
  const competition = await competitionService.create(req.body);

  res.status(201).json({
    success: true,
    data: competition,
  });
});

/**
 * @desc    Update competition
 * @route   PUT /api/competitions/:id
 * @access  Private/Admin
 */
const updateCompetition = asyncHandler(async (req, res) => {
  const competition = await competitionService.update(req.params.id, req.body);

  res.json({
    success: true,
    data: competition,
  });
});

/**
 * @desc    Delete competition
 * @route   DELETE /api/competitions/:id
 * @access  Private/Admin
 */
const deleteCompetition = asyncHandler(async (req, res) => {
  await competitionService.delete(req.params.id);

  res.json({
    success: true,
    message: "Competition deleted successfully.",
  });
});

/**
 * @desc    Get seasons
 * @route   GET /api/competitions/seasons
 * @access  Private
 */
const getSeasons = asyncHandler(async (req, res) => {
  const seasons = await competitionService.getSeasons();

  res.json({
    success: true,
    data: seasons,
  });
});

/**
 * @desc    Get competition statistics
 * @route   GET /api/competitions/:id/statistics
 * @access  Private
 */
const getCompetitionStatistics = asyncHandler(async (req, res) => {
  const statistics = await competitionService.getStatistics(req.params.id);

  res.json({
    success: true,
    data: statistics,
  });
});

/**
 * @desc    Get global competition summary
 * @route   GET /api/competitions/summary
 * @access  Private
 */
const getCompetitionSummary = asyncHandler(async (req, res) => {
  const summary = await competitionService.getGlobalSummary();

  res.json({
    success: true,
    data: summary,
  });
});

module.exports = {
  getCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getSeasons,
  getCompetitionStatistics,
  getCompetitionSummary,
};

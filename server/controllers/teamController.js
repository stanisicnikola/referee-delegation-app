const { teamService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get all teams
 * @route   GET /api/teams
 * @access  Private
 */
const getTeams = asyncHandler(async (req, res) => {
  const result = await teamService.findAll(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get team by ID
 * @route   GET /api/teams/:id
 * @access  Private
 */
const getTeam = asyncHandler(async (req, res) => {
  const team = await teamService.findById(req.params.id);

  res.json({
    success: true,
    data: team,
  });
});

/**
 * @desc    Create team
 * @route   POST /api/teams
 * @access  Private/Admin
 */
const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.create(req.body);

  res.status(201).json({
    success: true,
    data: team,
  });
});

/**
 * @desc    Update team
 * @route   PUT /api/teams/:id
 * @access  Private/Admin
 */
const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.update(req.params.id, req.body);

  res.json({
    success: true,
    data: team,
  });
});

/**
 * @desc    Delete team
 * @route   DELETE /api/teams/:id
 * @access  Private/Admin
 */
const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.delete(req.params.id);

  res.json({
    success: true,
    message: "Team deleted successfully.",
  });
});

/**
 * @desc    Upload team logo
 * @route   PUT /api/teams/:id/logo
 * @access  Private/Admin
 */
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image.",
    });
  }

  const logoPath = `/uploads/teams/${req.file.filename}`;
  const team = await teamService.updateLogo(req.params.id, logoPath);

  res.json({
    success: true,
    data: team,
  });
});

/**
 * @desc    Get team statistics
 * @route   GET /api/teams/stats
 * @access  Private
 */
const getTeamStats = asyncHandler(async (req, res) => {
  const stats = await teamService.getStats();

  res.json({
    success: true,
    data: stats,
  });
});

module.exports = {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  uploadLogo,
  getTeamStats,
};

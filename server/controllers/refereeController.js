const { refereeService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get all referees
 * @route   GET /api/referees
 * @access  Private
 */
const getReferees = asyncHandler(async (req, res) => {
  const result = await refereeService.findAll(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get referee by ID
 * @route   GET /api/referees/:id
 * @access  Private
 */
const getReferee = asyncHandler(async (req, res) => {
  const referee = await refereeService.findById(req.params.id);

  res.json({
    success: true,
    data: referee,
  });
});

/**
 * @desc    Create referee
 * @route   POST /api/referees
 * @access  Private/Admin
 */
const createReferee = asyncHandler(async (req, res) => {
  const referee = await refereeService.create(req.body);

  res.status(201).json({
    success: true,
    data: referee,
  });
});

/**
 * @desc    Update referee
 * @route   PUT /api/referees/:id
 * @access  Private/Admin
 */
const updateReferee = asyncHandler(async (req, res) => {
  const referee = await refereeService.update(req.params.id, req.body);

  res.json({
    success: true,
    data: referee,
  });
});

/**
 * @desc    Delete referee
 * @route   DELETE /api/referees/:id
 * @access  Private/Admin
 */
const deleteReferee = asyncHandler(async (req, res) => {
  await refereeService.delete(req.params.id);

  res.json({
    success: true,
    message: "Referee deleted successfully.",
  });
});

/**
 * @desc    Get referee assignments
 * @route   GET /api/referees/:id/assignments
 * @access  Private
 */
const getRefereeAssignments = asyncHandler(async (req, res) => {
  const result = await refereeService.getAssignments(req.params.id, req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get referee statistics
 * @route   GET /api/referees/:id/statistics
 * @access  Private
 */
const getRefereeStatistics = asyncHandler(async (req, res) => {
  const statistics = await refereeService.getStatistics(req.params.id);

  res.json({
    success: true,
    data: statistics,
  });
});

/**
 * @desc    Get referee overall statistics
 * @route   GET /api/referees/statistics
 * @access  Private
 */
const getRefereesStatistics = asyncHandler(async (req, res) => {
  const statistics = await refereeService.getOverallStatistics();

  res.json({
    success: true,
    data: statistics,
  });
});

/**
 * @desc    Get available referees for date
 * @route   GET /api/referees/available
 * @access  Private/Admin,Delegate
 */
const getAvailableReferees = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const referees = await refereeService.getAvailableForDate(date);

  res.json({
    success: true,
    data: referees,
  });
});

/**
 * @desc    Get my assignments (for logged in referee)
 * @route   GET /api/referees/my-assignments
 * @access  Private/Referee
 */
const getMyAssignments = asyncHandler(async (req, res) => {
  // Get referee linked to current user
  const referee = await refereeService.findByUserId(req.user.id);
  const result = await refereeService.getAssignments(referee.id, req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get my statistics (for logged in referee)
 * @route   GET /api/referees/my-statistics
 * @access  Private/Referee
 */
const getMyStatistics = asyncHandler(async (req, res) => {
  const referee = await refereeService.findByUserId(req.user.id);
  const statistics = await refereeService.getStatistics(referee.id);

  res.json({
    success: true,
    data: statistics,
  });
});

module.exports = {
  getReferees,
  getReferee,
  createReferee,
  updateReferee,
  deleteReferee,
  getRefereeAssignments,
  getRefereeStatistics,
  getRefereesStatistics,
  getAvailableReferees,
  getMyAssignments,
  getMyStatistics,
};

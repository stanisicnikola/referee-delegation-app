const { dashboardService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get aggregated dashboard data
 * @route   GET /api/dashboard
 * @access  Private/Admin
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { period = "7days" } = req.query;
  const data = await dashboardService.getDashboardData(period);

  res.json({
    success: true,
    data,
  });
});

module.exports = {
  getDashboard,
};

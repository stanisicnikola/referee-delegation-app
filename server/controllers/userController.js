const { userService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.findAll(req.query);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.delete(req.params.id);

  res.json({
    success: true,
    message: "User deleted successfully.",
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/statistics
 * @access  Private/Admin
 */
const getUserStatistics = asyncHandler(async (req, res) => {
  const statistics = await userService.getStatistics();

  res.json({
    success: true,
    data: statistics,
  });
});

/**
 * @desc    Reset user password
 * @route   PUT /api/users/:id/reset-password
 * @access  Private/Admin
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  await userService.resetPassword(req.params.id, newPassword);

  res.json({
    success: true,
    message: "Password reset successfully.",
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStatistics,
  resetPassword,
};

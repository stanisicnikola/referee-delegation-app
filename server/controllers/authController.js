const { authService } = require("../services");
const { asyncHandler } = require("../middlewares");

/**
 * @desc    User login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    User registration (admin only)
 * @route   POST /api/auth/register
 * @access  Private/Admin
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Referee registration (admin only)
 * @route   POST /api/auth/register-referee
 * @access  Private/Admin
 */
const registerReferee = asyncHandler(async (req, res) => {
  const result = await authService.registerReferee(req.body);

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.json({
    success: true,
    message: "Password changed successfully.",
  });
});

module.exports = {
  login,
  register,
  registerReferee,
  getMe,
  changePassword,
};

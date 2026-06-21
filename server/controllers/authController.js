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
 * @desc    Update current user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateCurrentUser(
    req.user.id,
    req.validatedBody || req.body,
  );

  res.json({
    success: true,
    message: "Profile updated successfully.",
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
  const result = await authService.changePassword(
    req.user.id,
    currentPassword,
    newPassword,
  );

  res.json({
    success: true,
    message: result.message,
    data: result.user,
  });
});

/**
 * @desc    Request password reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.requestPasswordReset(email);

  res.json({
    success: true,
    message: result.message,
  });
});

/**
 * @desc    Reset password with one-time token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPasswordWithToken(token, newPassword);

  res.json({
    success: true,
    message: "Password has been updated successfully.",
  });
});

/**
 * @desc    Verify current password
 * @route   POST /api/auth/verify-password
 * @access  Private
 */
const verifyPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  await authService.verifyPassword(req.user.id, password);

  res.json({
    success: true,
    message: "Password verified.",
  });
});

/**
 * @desc    Delete current user account
 * @route   DELETE /api/auth/me
 * @access  Private
 */
const deleteMe = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user.id);

  res.json({
    success: true,
    message: "Account deleted successfully.",
  });
});

module.exports = {
  login,
  register,
  registerReferee,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyPassword,
  deleteMe,
};

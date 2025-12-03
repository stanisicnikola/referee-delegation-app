const { authenticate, authorize, optionalAuth } = require("./auth");
const { errorHandler, AppError, asyncHandler } = require("./errorHandler");
const { validate, validateBody, validateQuery, validateParams } = require("./validate");
const { uploadTeamLogo, uploadAvatar } = require("./upload");

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  errorHandler,
  AppError,
  asyncHandler,
  validate,
  validateBody,
  validateQuery,
  validateParams,
  uploadTeamLogo,
  uploadAvatar,
};

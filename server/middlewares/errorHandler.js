// Central error handler
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Data validation error.",
      errors: messages,
    });
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return res.status(400).json({
      success: false,
      message: `Value for ${field} already exists.`,
    });
  }

  // Sequelize foreign key errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Referenced record does not exist.",
    });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    const messages = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Data validation error.",
      errors: messages,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper to avoid try-catch in controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
};

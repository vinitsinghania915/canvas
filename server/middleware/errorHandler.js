const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      code: "DUPLICATE_ERROR",
      message: `${field} already exists`,
      details: `The ${field} you provided is already in use`,
    });
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      code: "INVALID_ID",
      message: "Invalid ID format",
      details: "The provided ID is not valid",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid token",
      details: "The provided token is not valid",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      code: "TOKEN_EXPIRED",
      message: "Token expired",
      details: "Please login again",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Internal server error",
    details:
      process.env.NODE_ENV === "development"
        ? err.stack
        : "Something went wrong",
  });
};

module.exports = errorHandler;

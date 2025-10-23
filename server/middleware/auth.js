const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        code: "UNAUTHORIZED",
        message: "No token provided",
        details: "Access token is required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Invalid token",
        details: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Invalid token",
      details: error.message,
    });
  }
};

module.exports = auth;

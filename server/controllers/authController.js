const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { registerSchema, loginSchema } = require("../validation/schemas");

// Register user
const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        code: "USER_EXISTS",
        message: "User already exists",
        details: "A user with this email or username already exists",
      });
    }

    const user = new User(validatedData);
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      code: "SUCCESS",
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user || !(await user.comparePassword(validatedData.password))) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
        details: "Email or password is incorrect",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      code: "SUCCESS",
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  res.json({
    code: "SUCCESS",
    message: "User retrieved successfully",
    data: {
      user: req.user,
    },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};

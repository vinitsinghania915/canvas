const express = require("express");
const auth = require("../middleware/auth");
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getCurrentUser);

module.exports = router;

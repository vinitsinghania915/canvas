const express = require("express");
const auth = require("../middleware/auth");
const {
  setSocketIO,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  resolveComment,
} = require("../controllers/commentController");

const router = express.Router();

// Comment routes
router.get("/design/:designId", auth, getComments);
router.post("/design/:designId", auth, addComment);
router.put("/:commentId", auth, updateComment);
router.delete("/:commentId", auth, deleteComment);
router.post("/:commentId/replies", auth, addReply);
router.patch("/:commentId/resolve", auth, resolveComment);

module.exports = { router, setSocketIO };

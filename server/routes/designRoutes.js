const express = require("express");
const auth = require("../middleware/auth");
const {
  getDesigns,
  createDesign,
  getDesign,
  updateDesign,
  deleteDesign,
  addCollaborator,
  removeCollaborator,
} = require("../controllers/designController");

const router = express.Router();

// Design routes
router.get("/", auth, getDesigns);
router.post("/", auth, createDesign);
router.get("/:id", auth, getDesign);
router.put("/:id", auth, updateDesign);
router.delete("/:id", auth, deleteDesign);
router.post("/:id/collaborators", auth, addCollaborator);
router.delete("/:id/collaborators/:userId", auth, removeCollaborator);

module.exports = router;

const express = require("express");
const Design = require("../models/Design");
const {
  createDesignSchema,
  updateDesignSchema,
} = require("../validation/schemas");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all designs for current user
router.get("/", auth, async (req, res, next) => {
  try {
    const designs = await Design.find({
      $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }],
    })
      .populate("owner", "username avatar")
      .populate("collaborators.user", "username avatar")
      .sort({ updatedAt: -1 });

    res.json({
      code: "SUCCESS",
      message: "Designs retrieved successfully",
      data: { designs },
    });
  } catch (error) {
    next(error);
  }
});

// Create new design
router.post("/", auth, async (req, res, next) => {
  try {
    const validatedData = createDesignSchema.parse(req.body);

    const design = new Design({
      ...validatedData,
      owner: req.user._id,
    });

    await design.save();
    await design.populate("owner", "username avatar");

    res.status(201).json({
      code: "SUCCESS",
      message: "Design created successfully",
      data: { design },
    });
  } catch (error) {
    next(error);
  }
});

// Get single design
router.get("/:id", auth, async (req, res, next) => {
  try {
    const design = await Design.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { "collaborators.user": req.user._id },
        { isPublic: true },
      ],
    })
      .populate("owner", "username avatar")
      .populate("collaborators.user", "username avatar");

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have access to it",
      });
    }

    res.json({
      code: "SUCCESS",
      message: "Design retrieved successfully",
      data: { design },
    });
  } catch (error) {
    next(error);
  }
});

// Update design
router.put("/:id", auth, async (req, res, next) => {
  try {
    const validatedData = updateDesignSchema.parse(req.body);

    const design = await Design.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        {
          "collaborators.user": req.user._id,
          "collaborators.role": "editor",
        },
      ],
    });

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have permission to edit it",
      });
    }

    Object.assign(design, validatedData);
    await design.save();
    await design.populate("owner", "username avatar");
    await design.populate("collaborators.user", "username avatar");

    res.json({
      code: "SUCCESS",
      message: "Design updated successfully",
      data: { design },
    });
  } catch (error) {
    next(error);
  }
});

// Delete design
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const design = await Design.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have permission to delete it",
      });
    }

    await Design.findByIdAndDelete(req.params.id);

    res.json({
      code: "SUCCESS",
      message: "Design deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// Add collaborator
router.post("/:id/collaborators", auth, async (req, res, next) => {
  try {
    const { userId, role = "editor" } = req.body;

    const design = await Design.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have permission to manage collaborators",
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = design.collaborators.find(
      (collab) => collab.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({
        code: "COLLABORATOR_EXISTS",
        message: "User is already a collaborator",
        details: "The user is already added as a collaborator on this design",
      });
    }

    design.collaborators.push({ user: userId, role });
    await design.save();
    await design.populate("collaborators.user", "username avatar");

    res.json({
      code: "SUCCESS",
      message: "Collaborator added successfully",
      data: { design },
    });
  } catch (error) {
    next(error);
  }
});

// Remove collaborator
router.delete("/:id/collaborators/:userId", auth, async (req, res, next) => {
  try {
    const design = await Design.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have permission to manage collaborators",
      });
    }

    design.collaborators = design.collaborators.filter(
      (collab) => collab.user.toString() !== req.params.userId
    );

    await design.save();
    await design.populate("collaborators.user", "username avatar");

    res.json({
      code: "SUCCESS",
      message: "Collaborator removed successfully",
      data: { design },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require("express");
const Comment = require("../models/Comment");
const Design = require("../models/Design");
const User = require("../models/User");
const {
  createCommentSchema,
  updateCommentSchema,
  addReplySchema,
} = require("../validation/schemas");
const auth = require("../middleware/auth");

// Socket.io instance (will be set by the main server)
let io = null;
const setSocketIO = (socketIO) => {
  io = socketIO;
};

const router = express.Router();

// Get comments for a design
router.get("/design/:designId", auth, async (req, res, next) => {
  try {
    const design = await Design.findOne({
      _id: req.params.designId,
      $or: [
        { owner: req.user._id },
        { "collaborators.user": req.user._id },
        { isPublic: true },
      ],
    });

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have access to it",
      });
    }

    const comments = await Comment.find({ design: req.params.designId })
      .populate("author", "username avatar")
      .populate("mentions", "username avatar")
      .populate("replies.author", "username avatar")
      .sort({ createdAt: -1 });

    res.json({
      code: "SUCCESS",
      message: "Comments retrieved successfully",
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
});

// Create comment
router.post("/design/:designId", auth, async (req, res, next) => {
  try {
    const validatedData = createCommentSchema.parse(req.body);

    const design = await Design.findOne({
      _id: req.params.designId,
      $or: [
        { owner: req.user._id },
        { "collaborators.user": req.user._id },
        { isPublic: true },
      ],
    });

    if (!design) {
      return res.status(404).json({
        code: "DESIGN_NOT_FOUND",
        message: "Design not found",
        details:
          "The requested design does not exist or you do not have access to it",
      });
    }

    // Validate mentions
    if (validatedData.mentions && validatedData.mentions.length > 0) {
      const mentionedUsers = await User.find({
        _id: { $in: validatedData.mentions },
      });

      if (mentionedUsers.length !== validatedData.mentions.length) {
        return res.status(400).json({
          code: "INVALID_MENTIONS",
          message: "Invalid mentions",
          details: "Some mentioned users do not exist",
        });
      }
    }

    const comment = new Comment({
      ...validatedData,
      design: req.params.designId,
      author: req.user._id,
    });

    await comment.save();
    await comment.populate("author", "username avatar");
    await comment.populate("mentions", "username avatar");

    // Emit socket event for real-time updates
    if (io) {
      io.to(`design-${req.params.designId}`).emit("comment-added", {
        comment,
        userId: req.user._id,
        username: req.user.username,
        timestamp: Date.now(),
      });
    }

    res.status(201).json({
      code: "SUCCESS",
      message: "Comment created successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
});

// Update comment
router.put("/:id", auth, async (req, res, next) => {
  try {
    const validatedData = updateCommentSchema.parse(req.body);

    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!comment) {
      return res.status(404).json({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        details:
          "The requested comment does not exist or you do not have permission to edit it",
      });
    }

    Object.assign(comment, validatedData);
    await comment.save();
    await comment.populate("author", "username avatar");
    await comment.populate("mentions", "username avatar");
    await comment.populate("replies.author", "username avatar");

    res.json({
      code: "SUCCESS",
      message: "Comment updated successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
});

// Delete comment
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!comment) {
      return res.status(404).json({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        details:
          "The requested comment does not exist or you do not have permission to delete it",
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      code: "SUCCESS",
      message: "Comment deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// Add reply to comment
router.post("/:id/replies", auth, async (req, res, next) => {
  try {
    const validatedData = addReplySchema.parse(req.body);

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        details: "The requested comment does not exist",
      });
    }

    // Check if user has access to the design
    const design = await Design.findOne({
      _id: comment.design,
      $or: [
        { owner: req.user._id },
        { "collaborators.user": req.user._id },
        { isPublic: true },
      ],
    });

    if (!design) {
      return res.status(403).json({
        code: "ACCESS_DENIED",
        message: "Access denied",
        details: "You do not have access to this design",
      });
    }

    comment.replies.push({
      author: req.user._id,
      content: validatedData.content,
    });

    await comment.save();
    await comment.populate("author", "username avatar");
    await comment.populate("mentions", "username avatar");
    await comment.populate("replies.author", "username avatar");

    res.json({
      code: "SUCCESS",
      message: "Reply added successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { router, setSocketIO };

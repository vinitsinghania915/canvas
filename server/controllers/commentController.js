const Design = require("../models/Design");
const Comment = require("../models/Comment");
const User = require("../models/User");
const {
  createCommentSchema,
  updateCommentSchema,
  addReplySchema,
} = require("../validation/schemas");

let io = null;
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Get comments for a design
const getComments = async (req, res, next) => {
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
};

// Add comment to design
const addComment = async (req, res, next) => {
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

    const comment = new Comment({
      ...validatedData,
      design: req.params.designId,
      author: req.user._id,
    });

    await comment.save();
    await comment.populate("author", "username avatar");

    // Emit real-time comment event
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
      message: "Comment added successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

// Update comment
const updateComment = async (req, res, next) => {
  try {
    const validatedData = updateCommentSchema.parse(req.body);

    const comment = await Comment.findOne({
      _id: req.params.commentId,
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
    await comment.populate("replies.author", "username avatar");

    // Emit real-time comment update event
    if (io) {
      io.to(`design-${comment.design}`).emit("comment-updated", {
        comment,
        userId: req.user._id,
        username: req.user.username,
        timestamp: Date.now(),
      });
    }

    res.json({
      code: "SUCCESS",
      message: "Comment updated successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
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

    const designId = comment.design;
    await Comment.findByIdAndDelete(req.params.commentId);

    // Emit real-time comment delete event
    if (io) {
      io.to(`design-${designId}`).emit("comment-deleted", {
        commentId: req.params.commentId,
        userId: req.user._id,
        username: req.user.username,
        timestamp: Date.now(),
      });
    }

    res.json({
      facts: "SUCCESS",
      message: "Comment deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Add reply to comment
const addReply = async (req, res, next) => {
  try {
    const validatedData = addReplySchema.parse(req.body);

    const comment = await Comment.findOne({
      _id: req.params.commentId,
      design: {
        $in: await Design.find({
          $or: [
            { owner: req.user._id },
            { "collaborators.user": req.user._id },
            { isPublic: true },
          ],
        }).distinct("_id"),
      },
    });

    if (!comment) {
      return res.status(404).json({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        details:
          "The requested comment does not exist or you do not have access to it",
      });
    }

    const reply = {
      ...validatedData,
      author: req.user._id,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await comment.save();
    await comment.populate("author", "username avatar");
    await comment.populate("replies.author", "username avatar");

    // Emit real-time comment update event
    if (io) {
      io.to(`design-${comment.design}`).emit("comment-updated", {
        comment,
        userId: req.user._id,
        username: req.user.username,
        timestamp: Date.now(),
      });
    }

    res.json({
      code: "SUCCESS",
      message: "Reply added successfully",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

// Resolve comment
const resolveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      author: req.user._id,
    });

    if (!comment) {
      return res.status(404).json({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        details:
          "The requested comment does not exist or you do not have permission to resolve it",
      });
    }

    comment.isResolved = !comment.isResolved;
    await comment.save();
    await comment.populate("author", "username avatar");
    await comment.populate("replies.author", "username avatar");

    // Emit real-time comment update event
    if (io) {
      io.to(`design-${comment.design}`).emit("comment-updated", {
        comment,
        userId: req.user._id,
        username: req.user.username,
        timestamp: Date.now(),
      });
    }

    res.json({
      code: "SUCCESS",
      message: `Comment ${
        comment.isResolved ? "resolved" : "unresolved"
      } successfully`,
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setSocketIO,
  testComment,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  resolveComment,
};

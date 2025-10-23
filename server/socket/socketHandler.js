const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};

const setupSocketHandlers = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join design room
    socket.on("join-design", (designId) => {
      socket.join(`design-${designId}`);
      socket.to(`design-${designId}`).emit("user-joined", {
        userId: socket.userId,
        username: socket.user.username,
        avatar: socket.user.avatar,
      });
    });

    // Leave design room
    socket.on("leave-design", (designId) => {
      socket.leave(`design-${designId}`);
      socket.to(`design-${designId}`).emit("user-left", {
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    // Handle canvas updates
    socket.on("canvas-update", (data) => {
      const { designId, objects, canvas } = data;
      socket.to(`design-${designId}`).emit("canvas-updated", {
        objects,
        canvas,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: Date.now(),
      });
    });

    // Handle selection changes
    socket.on("selection-change", (data) => {
      const { designId, selectedObjectIds } = data;
      socket.to(`design-${designId}`).emit("selection-changed", {
        selectedObjectIds,
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    // Handle comment events
    socket.on("comment-added", (data) => {
      const { designId, comment } = data;
      socket.to(`design-${designId}`).emit("comment-added", {
        comment,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: Date.now(),
      });
    });

    socket.on("comment-updated", (data) => {
      const { designId, comment } = data;
      socket.to(`design-${designId}`).emit("comment-updated", {
        comment,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: Date.now(),
      });
    });

    socket.on("comment-deleted", (data) => {
      const { designId, commentId } = data;
      socket.to(`design-${designId}`).emit("comment-deleted", {
        commentId,
        userId: socket.userId,
        username: socket.user.username,
        timestamp: Date.now(),
      });
    });

    // Handle cursor position
    socket.on("cursor-move", (data) => {
      const { designId, position } = data;
      socket.to(`design-${designId}`).emit("cursor-moved", {
        position,
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    // Handle comments
    socket.on("comment-added", (data) => {
      const { designId, comment } = data;
      socket.to(`design-${designId}`).emit("comment-added", {
        comment,
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    socket.on("comment-updated", (data) => {
      const { designId, comment } = data;
      socket.to(`design-${designId}`).emit("comment-updated", {
        comment,
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    socket.on("comment-deleted", (data) => {
      const { designId, commentId } = data;
      socket.to(`design-${designId}`).emit("comment-deleted", {
        commentId,
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    // Handle undo/redo
    socket.on("undo-action", (data) => {
      const { designId } = data;
      socket.to(`design-${designId}`).emit("undo-action", {
        userId: socket.userId,
        username: socket.user.username,
        timestamp: Date.now(),
      });
    });

    socket.on("redo-action", (data) => {
      const { designId } = data;
      socket.to(`design-${designId}`).emit("redo-action", {
        userId: socket.userId,
        username: socket.user.username,
        timestamp: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });
};

module.exports = setupSocketHandlers;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const setupSocketHandlers = require("./socket/socketHandler");

// Import routes
const authRoutes = require("./routes/auth");
const designRoutes = require("./routes/designs");
const { router: commentRoutes, setSocketIO } = require("./routes/comments");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// MongoDB connection health check
const mongoose = require("mongoose");
setInterval(() => {
  if (mongoose.connection.readyState !== 1) {
    console.log("MongoDB connection lost, attempting to reconnect...");
    connectDB();
  }
}, 30000); // Check every 30 seconds

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/comments", commentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    code: "SUCCESS",
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Set socket.io instance for comment routes
setSocketIO(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: "Route not found",
    details: `The requested route ${req.originalUrl} does not exist`,
  });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    console.log("Process terminated");
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    console.log("Process terminated");
    process.exit(0);
  });
});

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

const auth = require("./middleware/auth");
const {
  register,
  login,
  getCurrentUser,
} = require("./controllers/authController");

// Import routes
const authRoutes = require("./routes/authRoutes");
const designRoutes = require("./routes/designRoutes");
const {
  router: commentRoutes,
  setSocketIO,
} = require("./routes/commentRoutes");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3000",
      "https://localhost:3000",
      "https://canvas-ve3k.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
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
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });

// Middleware
app.set("trust proxy", 1); // Trust first proxy (Render, Vercel, etc.)
app.use(helmet());
// app.use(limiter);
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:3000",
        "http://localhost:3000",
        "https://localhost:3000",
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For Render deployment, allow any origin from your domain
      if (origin && origin.includes("render.com")) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Debug middleware for Render deployment
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
console.log("Registering routes...");
app.use("/api/auth", authRoutes);
console.log("Auth routes registered");
app.use("/api/designs", designRoutes);
console.log("Design routes registered");
app.use("/api/comments", commentRoutes);
console.log("Comment routes registered");

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", auth, getCurrentUser);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    code: "SUCCESS",
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 5000,
      mongodb:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});

// Test endpoint for debugging
app.post("/api/test", (req, res) => {
  res.json({
    code: "SUCCESS",
    message: "POST endpoint is working",
    data: {
      timestamp: new Date().toISOString(),
      body: req.body,
      headers: req.headers,
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
  );
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

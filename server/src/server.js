/**
 * Homey Mock Server
 * In-memory development server with realistic data
 */

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import billRoutes from "./routes/bills.js";
import chatRoutes from "./routes/chat.js";
import householdRoutes from "./routes/households.js";
import notificationRoutes from "./routes/notifications.js";
import taskRoutes from "./routes/tasks.js";

// Import middleware
import { mockAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { responseFormatter } from "./middleware/responseFormatter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.MOCK_PORT || 8000;

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// CORS - Allow all origins for development
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  })
);

// Logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Mock auth middleware (bypasses real auth)
app.use(mockAuth);

// Response formatter
app.use(responseFormatter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: "development",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", authRoutes); // Profile routes are in auth
app.use("/api/invite", authRoutes); // Invite routes are in auth
app.use("/api/households", householdRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/households/:householdId/messages", chatRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/polls", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
      details: {
        method: req.method,
        path: req.path,
        available_routes: [
          "/health",
          "/api/auth/*",
          "/api/households/*",
          "/api/tasks/*",
          "/api/bills/*",
          "/api/messages/*",
          "/api/notifications/*",
        ],
      },
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🎭 Homey Mock Server Running!

📍 Server: http://localhost:${PORT}
🔧 Health: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api

🚀 Features:
   ✅ Bypassed authentication (always authenticated as Alex)
   ✅ Full CRUD operations for all resources
   ✅ Realistic mock data with relationships
   ✅ Real-time simulation (polling-based)
   ✅ File upload simulation
   ✅ Error scenarios and validation

🏠 Mock Data:
   👥 4 Users in "Downtown Loft" household
   ✅ 4 Tasks (1 completed, 1 overdue)
   💰 3 Bills with payment tracking
   💬 5 Chat messages with polls
   🔔 3 Notifications

💡 Tips:
   - All API endpoints match your production schema
   - Use any email/password for login (bypassed)
   - Data resets on server restart
   - Check console for request logs
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Basic security middleware
app.use(express.json({ limit: "10kb" })); // Limits JSON body size

// CORS Configuration (simplified)
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL
    : "http://localhost:5173",
  credentials: true
}));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
  });
}

// Create HTTP server
const server = http.createServer(app);

// Socket.io Configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
      : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.io Logic (unchanged)
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register-user", (userId) => {
    userSocketMap[userId] = socket.id;
    io.emit("online-users", Object.keys(userSocketMap));
  });

  socket.on("unregister-user", () => {
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        io.emit("online-users", Object.keys(userSocketMap));
        break;
      }
    }
  });

  socket.on("send-message", ({ from, to, text }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit("receive-message", { 
        from, 
        text, 
        timestamp: new Date().toISOString() 
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        io.emit("online-users", Object.keys(userSocketMap));
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
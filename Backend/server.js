import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import connectDB from "./config/db.js"
import path from "path"
import { fileURLToPath } from "url"

import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

// Configuration
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to MongoDB
connectDB()

// Initialize Express app
const app = express()
app.use(cors())
app.use(express.json())

// REST API routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/notifications", notificationRoutes)

// Debug route to check if server is running
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
  })
}

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : "*",
    methods: ["GET", "POST"],
  },
})

// Map of userId → socketId
const userSocketMap = {}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Register this socket for a particular user
  socket.on("register-user", (userId) => {
    userSocketMap[userId] = socket.id
    console.log(`Registered user ${userId} on socket ${socket.id}`)

    // Broadcast online users to all clients
    io.emit("online-users", Object.keys(userSocketMap))
  })

  // Handle unregistering user
  socket.on("unregister-user", () => {
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId]
        console.log(`Unregistered user ${userId}`)

        // Broadcast updated online users to all clients
        io.emit("online-users", Object.keys(userSocketMap))
        break
      }
    }
  })

  // Handle one-to-one messages
  socket.on("send-message", async ({ from, to, text }) => {
    console.log(`Message from ${from} to ${to}: ${text}`)

    // Save message to database (handled by API endpoint)

    const targetSocket = userSocketMap[to]
    if (targetSocket) {
      io.to(targetSocket).emit("receive-message", { from, text, timestamp: new Date().toISOString() })
      console.log(`Message sent to socket ${targetSocket}`)
    } else {
      console.log(`Target user ${to} not found or not connected`)
      // Notify the sender that the recipient is offline
      io.to(socket.id).emit("message-error", {
        error: "Recipient not available",
        to,
      })
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove any entries matching this socket
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId]
        console.log(`User ${userId} disconnected`)

        // Broadcast updated online users to all clients
        io.emit("online-users", Object.keys(userSocketMap))
        break
      }
    }
  })
})

// Make io available in controllers via req.app.get('io')
app.set("io", io)

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server and socket is running on port ${PORT}`)
})
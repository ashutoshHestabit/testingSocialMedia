import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

// Database connection
connectDB();

// Initialize Express app
const app = express();

// Middleware configuration
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 300000, // 5 minutes
    skipMiddlewares: true
  }
});

// Real-time functionality
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User registration
  socket.on('register-user', (userId) => {
    userSocketMap[userId] = socket.id;
    io.emit('online-users', Object.keys(userSocketMap));
  });

  // User deregistration
  socket.on('unregister-user', () => {
    Object.entries(userSocketMap).forEach(([userId, sockId]) => {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        io.emit('online-users', Object.keys(userSocketMap));
      }
    });
  });

  // Message handling
  socket.on('send-message', ({ from, to, text }) => {
    const targetSocket = userSocketMap[to];
    if (targetSocket) {
      io.to(targetSocket).emit('receive-message', {
        from,
        text,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    Object.entries(userSocketMap).forEach(([userId, sockId]) => {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        io.emit('online-users', Object.keys(userSocketMap));
      }
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on port ${PORT}`);
});
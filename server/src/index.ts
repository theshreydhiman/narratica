import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import passport from 'passport';
import { initializeDatabase } from './config/database';
import { configurePassport } from './config/passport';
import { createRedisStore } from './config/redis';
import { setupSocketHandlers } from './socket';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import chapterRoutes from './routes/chapters';
import aiRoutes from './routes/ai';
import userRoutes from './routes/users';
import exportRoutes from './routes/export';

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session setup
const sessionMiddleware = session({
  store: createRedisStore(),
  secret: process.env.SESSION_SECRET || 'narratica-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

app.use(sessionMiddleware);

// Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Share session with Socket.io
io.engine.use(sessionMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await initializeDatabase();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Narratica server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { io };

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { ClerkExpressRequireAuth, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import Game from './models/Game.js';
import dotenv from 'dotenv';
import cors from 'cors';
import clerk from '@clerk/clerk-sdk-node';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true,
}));

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, '../../Pong_Frontend/dist')));
app.use(ClerkExpressWithAuth());

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('Received token:', token);
  try {
    if (!token) throw new Error('No token provided');
    const auth = await clerk.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    socket.handshake.auth.userId = auth.sub;
    console.log('Token verified for user:', auth.sub);
    next();
  } catch (err) {
    console.error('Socket auth error:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log('A player connected:', userId);

  socket.on('join', async ({ userId: joiningUserId }) => {
    console.log(`${joiningUserId} joined the game`);
  });

  socket.on('disconnect', () => {
    console.log('A player disconnected:', userId);
  });
});

app.get('/api/test', ClerkExpressRequireAuth(), (req, res) => {
  res.json({ message: 'Hello from authenticated API', userId: req.auth.userId });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
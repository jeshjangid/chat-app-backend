import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: '*',
  credentials: true,
};

// initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User Connected ', userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User Disconnected ', userId);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

// middleware setup
app.use(cors(corsOptions));
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());

// route setup
app.use('/api/status', (req, res) => res.send('ok'));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

try {
  await connectDB();
} catch (err) {
  console.error('DB connection error:', err.message);
}

if(process.env.NODE_ENV !== 'production'){
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ` + PORT);
  });
}


// Export server for Vercel
export default server

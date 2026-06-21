import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/users', authMiddleware, getUserForSidebar)
messageRouter.get('/:id', authMiddleware, getMessages)
messageRouter.put('/mark/:id', authMiddleware, markMessageAsSeen)
messageRouter.post('/send/:id', authMiddleware, sendMessage)


export default messageRouter
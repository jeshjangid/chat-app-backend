import express from 'express';
import {
  checkAuth,
  login,
  logout,
  refreshAccessToken,
  signUp,
  updateProfile,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.post('/refresh', refreshAccessToken);
userRouter.post('/logout', logout);
userRouter.put('/update-profile', authMiddleware, updateProfile);
userRouter.get('/check', authMiddleware, checkAuth);

export default userRouter;


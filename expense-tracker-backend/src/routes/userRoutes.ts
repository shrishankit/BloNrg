import express from 'express';
import { createUser, loginUser, getOnlineUsers, promoteToAdmin } from '../controllers/userController';
import { CreateUserInput, LoginUserInput } from '../types/user';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Register new user
router.post('/register', createUser);

// Login user
router.post('/login', loginUser as express.RequestHandler);

// Get online users count (admin only)
router.get('/online', authenticate, isAdmin, getOnlineUsers as express.RequestHandler);

// Promote user to admin (admin only)
router.post('/promote', authenticate, isAdmin, promoteToAdmin as express.RequestHandler);

export default router; 
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserInput, LoginUserInput, UserResponse, UserRole, User } from '../types/user';

const prisma = new PrismaClient();

export const createUser = async (req: Request<{}, {}, CreateUserInput>, res: Response) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName = '',
      lastName = '',
      address,
      phoneNo
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user - always set role as USER
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER',
        firstName,
        lastName,
        address,
        phoneNo
      } as any,
    }) as User;

    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    }) as User | null;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get online users count (admin only)
export const getOnlineUsers = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    // Get socket service from global
    const socketService = (global as any).socketService;
    
    if (!socketService) {
      return res.status(500).json({ message: 'Socket service not initialized' });
    }
    
    const onlineUsersCount = socketService.getOnlineUsersCount();
    const onlineUsers = socketService.getOnlineUsers();
    
    res.json({
      count: onlineUsersCount,
      users: onlineUsers
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const requestingUser = req.user as User;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if requesting user is admin
    // if (requestingUser.role !== 'ADMIN') {
    //   return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    // }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: `User not found with email: ${email}` });
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    const userResponse: UserResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json({
      message: 'User promoted to admin successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
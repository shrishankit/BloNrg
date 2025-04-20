import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types/user';

// Create a test Prisma client
export const prisma = new PrismaClient();

// Mock JWT secret for testing
process.env.JWT_SECRET = 'test-secret-key';

// Helper function to create a mock user
export const createMockUser = async (userRole = 'USER') => {
  return await prisma.user.create({
    data: {
      username: `testuser-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      password: 'hashedpassword',
      role: userRole,
      firstName: 'Test',
      lastName: 'User'
    } as any
  });
};

// Helper function to create a mock expense
export const createMockExpense = async (userId: number) => {
  return await prisma.expense.create({
    data: {
      userId,
      amount: 100.50,
      description: 'Test expense',
      category: 'Food',
      date: new Date()
    }
  });
};

// Helper function to generate a JWT token
export const generateToken = (user: User) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// Mock request and response objects
export const mockRequest = (options = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...options
  } as Request;
  return req;
};

interface MockResponseData {
  statusCode: number;
  data: any;
  status: (code: number) => MockResponseData;
  json: (data: any) => MockResponseData;
  send: (data: any) => MockResponseData;
}

export const mockResponse = () => {
  const res = {
    statusCode: 200,
    data: null,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.data = data; return this; },
    send: function(data: any) { this.data = data; return this; }
  };
  
  // Add all required Response properties with empty implementations
  return Object.assign(res, {
    headersSent: false,
    locals: {},
    app: {},
    charset: '',
    statusMessage: '',
    sendStatus: () => res,
    links: () => res,
    sendFile: () => res,
    download: () => res,
    redirect: () => res,
    render: () => res,
    vary: () => res,
    set: () => res,
    append: () => res,
    attachment: () => res,
    cookie: () => res,
    clearCookie: () => res,
    end: () => res,
    format: () => res,
    get: () => '',
    header: () => res,
    type: () => res,
    // Add other required properties with empty implementations
  }) as unknown as Response;
};

// Clean up database after tests
export const cleanupDatabase = async () => {
  // Skip cleanup if PRESERVE_DATABASE is set to true
  if (process.env.PRESERVE_DATABASE === 'true') {
    console.log('Skipping database cleanup as PRESERVE_DATABASE is set to true');
    return;
  }
  
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();
}; 
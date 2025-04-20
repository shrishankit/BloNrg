import { createUser, loginUser } from '../controllers/userController';
import { createMockUser, mockRequest, mockResponse, cleanupDatabase, prisma } from './setup';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('User Controller', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User'
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = mockRequest({
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
      });
      const res = mockResponse() as any;

      // Act
      await createUser(req, res);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.data).toHaveProperty('user');
      expect(res.data).toHaveProperty('token');
      expect(res.data.user.email).toBe('test@example.com');
      expect(res.data.user.username).toBe('testuser');
    });

    it('should return 400 if user already exists', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'hashedpassword'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const req = mockRequest({
        body: {
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse() as any;

      // Act
      await createUser(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.data).toHaveProperty('message', 'User already exists');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with correct credentials', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'loginuser',
        email: 'login@example.com',
        password: 'hashedPassword'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const req = mockRequest({
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse() as any;

      // Act
      await loginUser(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.data).toHaveProperty('user');
      expect(res.data).toHaveProperty('token');
      expect(res.data.user.email).toBe('login@example.com');
    });

    it('should return 401 with incorrect password', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'wrongpass',
        email: 'wrong@example.com',
        password: 'hashedPassword'
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const req = mockRequest({
        body: {
          email: 'wrong@example.com',
          password: 'wrongpassword'
        }
      });
      const res = mockResponse() as any;

      // Act
      await loginUser(req, res);

      // Assert
      expect(res.statusCode).toBe(401);
      expect(res.data).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 if user does not exist', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse() as any;

      // Act
      await loginUser(req, res);

      // Assert
      expect(res.statusCode).toBe(401);
      expect(res.data).toHaveProperty('message', 'Invalid credentials');
    });
  });
}); 
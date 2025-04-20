import { createUser, loginUser } from '../controllers/userController';
import { createMockUser, mockRequest, mockResponse, cleanupDatabase, prisma } from './setup';
import bcrypt from 'bcrypt';

describe('User Controller', () => {
  beforeEach(async () => {
    // Only cleanup if not preserving database
    if (process.env.PRESERVE_DATABASE !== 'true') {
      await cleanupDatabase();
    }
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
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
      await prisma.user.create({
        data: {
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'hashedpassword',
          role: 'USER' as any,
          firstName: 'Existing',
          lastName: 'User'
        } as any
      });

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
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          username: 'loginuser',
          email: 'login@example.com',
          password: hashedPassword,
          role: 'USER' as any,
          firstName: 'Login',
          lastName: 'User'
        } as any
      });

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
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          username: 'wrongpass',
          email: 'wrong@example.com',
          password: hashedPassword,
          role: 'USER' as any,
          firstName: 'Wrong',
          lastName: 'Password'
        } as any
      });

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
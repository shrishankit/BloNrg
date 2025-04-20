"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../controllers/userController");
const setup_1 = require("./setup");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe('User Controller', () => {
    beforeEach(async () => {
        await (0, setup_1.cleanupDatabase)();
    });
    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            // Arrange
            const req = (0, setup_1.mockRequest)({
                body: {
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User'
                }
            });
            const res = (0, setup_1.mockResponse)();
            // Act
            await (0, userController_1.createUser)(req, res);
            // Assert
            expect(res.statusCode).toBe(201);
            expect(res.data).toHaveProperty('user');
            expect(res.data).toHaveProperty('token');
            expect(res.data.user.email).toBe('test@example.com');
            expect(res.data.user.username).toBe('testuser');
        });
        it('should return 400 if user already exists', async () => {
            // Arrange
            await setup_1.prisma.user.create({
                data: {
                    username: 'existinguser',
                    email: 'existing@example.com',
                    password: 'hashedpassword',
                    role: 'USER',
                    firstName: 'Existing',
                    lastName: 'User'
                }
            });
            const req = (0, setup_1.mockRequest)({
                body: {
                    username: 'existinguser',
                    email: 'existing@example.com',
                    password: 'password123'
                }
            });
            const res = (0, setup_1.mockResponse)();
            // Act
            await (0, userController_1.createUser)(req, res);
            // Assert
            expect(res.statusCode).toBe(400);
            expect(res.data).toHaveProperty('message', 'User already exists');
        });
    });
    describe('loginUser', () => {
        it('should login user successfully with correct credentials', async () => {
            // Arrange
            const password = 'password123';
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const user = await setup_1.prisma.user.create({
                data: {
                    username: 'loginuser',
                    email: 'login@example.com',
                    password: hashedPassword,
                    role: 'USER',
                    firstName: 'Login',
                    lastName: 'User'
                }
            });
            const req = (0, setup_1.mockRequest)({
                body: {
                    email: 'login@example.com',
                    password: 'password123'
                }
            });
            const res = (0, setup_1.mockResponse)();
            // Act
            await (0, userController_1.loginUser)(req, res);
            // Assert
            expect(res.statusCode).toBe(200);
            expect(res.data).toHaveProperty('user');
            expect(res.data).toHaveProperty('token');
            expect(res.data.user.email).toBe('login@example.com');
        });
        it('should return 401 with incorrect password', async () => {
            // Arrange
            const password = 'password123';
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            await setup_1.prisma.user.create({
                data: {
                    username: 'wrongpass',
                    email: 'wrong@example.com',
                    password: hashedPassword,
                    role: 'USER',
                    firstName: 'Wrong',
                    lastName: 'Password'
                }
            });
            const req = (0, setup_1.mockRequest)({
                body: {
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                }
            });
            const res = (0, setup_1.mockResponse)();
            // Act
            await (0, userController_1.loginUser)(req, res);
            // Assert
            expect(res.statusCode).toBe(401);
            expect(res.data).toHaveProperty('message', 'Invalid credentials');
        });
        it('should return 401 if user does not exist', async () => {
            // Arrange
            const req = (0, setup_1.mockRequest)({
                body: {
                    email: 'nonexistent@example.com',
                    password: 'password123'
                }
            });
            const res = (0, setup_1.mockResponse)();
            // Act
            await (0, userController_1.loginUser)(req, res);
            // Assert
            expect(res.statusCode).toBe(401);
            expect(res.data).toHaveProperty('message', 'Invalid credentials');
        });
    });
});

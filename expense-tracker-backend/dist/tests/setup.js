"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupDatabase = exports.mockResponse = exports.mockRequest = exports.generateToken = exports.createMockExpense = exports.createMockUser = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Create a test Prisma client
exports.prisma = new client_1.PrismaClient();
// Mock JWT secret for testing
process.env.JWT_SECRET = 'test-secret-key';
// Helper function to create a mock user
const createMockUser = async (userRole = 'USER') => {
    return await exports.prisma.user.create({
        data: {
            username: `testuser-${Date.now()}`,
            email: `test-${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: userRole,
            firstName: 'Test',
            lastName: 'User'
        }
    });
};
exports.createMockUser = createMockUser;
// Helper function to create a mock expense
const createMockExpense = async (userId) => {
    return await exports.prisma.expense.create({
        data: {
            userId,
            amount: 100.50,
            description: 'Test expense',
            category: 'Food',
            date: new Date()
        }
    });
};
exports.createMockExpense = createMockExpense;
// Helper function to generate a JWT token
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '1h' });
};
exports.generateToken = generateToken;
// Mock request and response objects
const mockRequest = (options = {}) => {
    const req = {
        body: {},
        params: {},
        query: {},
        headers: {},
        user: undefined,
        ...options
    };
    return req;
};
exports.mockRequest = mockRequest;
const mockResponse = () => {
    const res = {
        statusCode: 200,
        data: null,
        status: function (code) { this.statusCode = code; return this; },
        json: function (data) { this.data = data; return this; },
        send: function (data) { this.data = data; return this; }
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
    });
};
exports.mockResponse = mockResponse;
// Clean up database after tests
const cleanupDatabase = async () => {
    await exports.prisma.expense.deleteMany();
    await exports.prisma.user.deleteMany();
};
exports.cleanupDatabase = cleanupDatabase;

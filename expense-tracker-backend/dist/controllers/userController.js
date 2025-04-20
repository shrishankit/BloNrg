"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlineUsers = exports.loginUser = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const createUser = async (req, res) => {
    try {
        const { username, email, password, firstName = '', lastName = '', address, phoneNo } = req.body;
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
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
            },
        });
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        res.status(201).json({
            message: 'User created successfully',
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createUser = createUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Compare passwords
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        res.json({
            message: 'Login successful',
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.loginUser = loginUser;
// Get online users count (admin only)
const getOnlineUsers = async (req, res) => {
    try {
        const user = req.user;
        // Check if user is admin
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        // Get socket service from global
        const socketService = global.socketService;
        if (!socketService) {
            return res.status(500).json({ message: 'Socket service not initialized' });
        }
        const onlineUsersCount = socketService.getOnlineUsersCount();
        const onlineUsers = socketService.getOnlineUsers();
        res.json({
            count: onlineUsersCount,
            users: onlineUsers
        });
    }
    catch (error) {
        console.error('Error getting online users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getOnlineUsers = getOnlineUsers;

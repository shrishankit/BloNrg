"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const roleAuth_1 = require("./roleAuth");
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Attach user to request object
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const authorize = (resourceUserId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            // Check if the authenticated user matches the resource owner or is an admin
            const userRole = req.user.role || roleAuth_1.UserRole.USER;
            if (req.user.id !== resourceUserId && userRole !== roleAuth_1.UserRole.ADMIN) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).json({ error: 'Authorization failed' });
        }
    };
};
exports.authorize = authorize;

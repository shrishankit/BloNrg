"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const user = req.user;
        if (user.role !== 'ADMIN') {
            res.status(403).json({ message: 'Admin privileges required' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin authorization error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.isAdmin = isAdmin;

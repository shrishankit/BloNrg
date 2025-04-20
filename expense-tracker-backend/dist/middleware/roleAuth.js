"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.UserRole = void 0;
// Define available roles
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Middleware to check if the authenticated user has the required role
 * This middleware should be used after the authenticate middleware
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists in request (added by authenticate middleware)
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Check if user has the required role
        const userRole = req.user.role || UserRole.USER;
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ error: 'Access denied: insufficient permissions' });
            return;
        }
        next();
    };
};
exports.checkRole = checkRole;

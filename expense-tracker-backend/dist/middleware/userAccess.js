"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserAccess = void 0;
const auth_1 = require("./auth");
/**
 * Middleware to check if the authenticated user has access to the requested resource
 * This middleware should be used after the authenticate middleware
 */
const checkUserAccess = (req, res, next) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
    }
    (0, auth_1.authorize)(userId)(req, res, next);
};
exports.checkUserAccess = checkUserAccess;

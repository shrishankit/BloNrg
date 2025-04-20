"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
// Register new user
router.post('/register', userController_1.createUser);
// Login user
router.post('/login', userController_1.loginUser);
// Get online users count (admin only)
router.get('/online', auth_1.authenticate, adminAuth_1.isAdmin, userController_1.getOnlineUsers);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseController_1 = require("../controllers/expenseController");
const auth_1 = require("../middleware/auth");
const userAccess_1 = require("../middleware/userAccess");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
// Get all expenses for a specific user (protected route)
router.get('/user/:userId', auth_1.authenticate, userAccess_1.checkUserAccess, expenseController_1.getUserExpenses);
// Get all expenses for all users (admin only)
router.get('/all', auth_1.authenticate, adminAuth_1.isAdmin, expenseController_1.getAllExpenses);
// Create a single expense
router.post('/', auth_1.authenticate, expenseController_1.createExpense);
// Create multiple expenses in bulk
router.post('/bulk', auth_1.authenticate, expenseController_1.createBulkExpenses);
// Delete a single expense
router.delete('/:id', auth_1.authenticate, expenseController_1.deleteExpense);
// Delete multiple expenses in bulk
router.delete('/bulk', auth_1.authenticate, expenseController_1.deleteBulkExpenses);
exports.default = router;

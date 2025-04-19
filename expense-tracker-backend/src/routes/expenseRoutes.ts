import express from 'express';
import { getUserExpenses, getAllExpenses, createExpense, createBulkExpenses, deleteExpense, deleteBulkExpenses } from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { checkUserAccess } from '../middleware/userAccess';
import { isAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Get all expenses for a specific user (protected route)
router.get('/user/:userId', authenticate, checkUserAccess, getUserExpenses as express.RequestHandler);

// Get all expenses for all users (admin only)
router.get('/all', authenticate, isAdmin, getAllExpenses as express.RequestHandler);

// Create a single expense
router.post('/', authenticate, createExpense as express.RequestHandler);

// Create multiple expenses in bulk
router.post('/bulk', authenticate, createBulkExpenses as express.RequestHandler);

// Delete a single expense
router.delete('/:id', authenticate, deleteExpense as express.RequestHandler);

// Delete multiple expenses in bulk
router.delete('/bulk', authenticate, deleteBulkExpenses as express.RequestHandler);

export default router; 
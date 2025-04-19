import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { User } from '../types/user';

const prisma = new PrismaClient();

// Get all expenses for a specific user
export const getUserExpenses = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check if the authenticated user is requesting their own expenses or is an admin
    const authenticatedUser = req.user as User;
    if (authenticatedUser.id !== userId && authenticatedUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all expenses for all users (admin only)
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    // Admin check is now handled by middleware
    
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a single expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { amount, description, category, date } = req.body;
    const userId = (req.user as User).id;

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        category,
        date: new Date(date),
        userId
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create multiple expenses in bulk
export const createBulkExpenses = async (req: Request, res: Response) => {
  try {
    const { expenses } = req.body;
    const userId = (req.user as User).id;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ message: 'Invalid request. Expected an array of expenses.' });
    }

    // Validate each expense in the array
    for (const expense of expenses) {
      if (!expense.amount || !expense.description || !expense.category || !expense.date) {
        return res.status(400).json({ 
          message: 'Each expense must have amount, description, category, and date fields.' 
        });
      }
    }

    // Create all expenses in a transaction
    const createdExpenses = await prisma.$transaction(
      expenses.map(expense => 
        prisma.expense.create({
          data: {
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: new Date(expense.date),
            userId
          }
        })
      )
    );

    res.status(201).json({
      message: `Successfully created ${createdExpenses.length} expenses`,
      expenses: createdExpenses
    });
  } catch (error) {
    console.error('Error creating bulk expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a single expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expenseId = parseInt(req.params.id);
    const userId = (req.user as User).id;
    const isAdmin = (req.user as User).role === 'ADMIN';

    // Check if expense exists and belongs to the user (or user is admin)
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.userId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: expenseId }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete multiple expenses in bulk
export const deleteBulkExpenses = async (req: Request, res: Response) => {
  try {
    const { expenseIds } = req.body;
    const userId = (req.user as User).id;
    const isAdmin = (req.user as User).role === 'ADMIN';

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({ message: 'Invalid request. Expected an array of expense IDs.' });
    }

    // Convert string IDs to integers
    const ids = expenseIds.map(id => parseInt(id));

    // Check if all expenses exist and belong to the user (or user is admin)
    const expenses = await prisma.expense.findMany({
      where: { id: { in: ids } }
    });

    if (expenses.length !== ids.length) {
      return res.status(404).json({ message: 'One or more expenses not found' });
    }

    // Check if user has permission to delete all expenses
    if (!isAdmin) {
      const unauthorizedExpenses = expenses.filter((expense: { userId: number }) => expense.userId !== userId);
      if (unauthorizedExpenses.length > 0) {
        return res.status(403).json({ message: 'Access denied to one or more expenses' });
      }
    }

    // Delete all expenses in a transaction
    await prisma.$transaction(
      ids.map(id => 
        prisma.expense.delete({
          where: { id }
        })
      )
    );

    res.json({ 
      message: `Successfully deleted ${ids.length} expenses` 
    });
  } catch (error) {
    console.error('Error deleting bulk expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
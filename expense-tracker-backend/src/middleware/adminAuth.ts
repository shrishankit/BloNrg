import { Request, Response, NextFunction } from 'express';
import { User } from '../types/user';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = req.user as User;
    if (user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin privileges required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
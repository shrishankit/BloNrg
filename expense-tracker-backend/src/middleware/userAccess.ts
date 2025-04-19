import { Request, Response, NextFunction } from 'express';
import { authorize } from './auth';

/**
 * Middleware to check if the authenticated user has access to the requested resource
 * This middleware should be used after the authenticate middleware
 */
export const checkUserAccess = (req: Request, res: Response, next: NextFunction): void => {
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }
  
  authorize(userId)(req, res, next);
}; 
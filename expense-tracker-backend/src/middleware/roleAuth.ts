import { Request, Response, NextFunction } from 'express';

// Define available roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

/**
 * Middleware to check if the authenticated user has the required role
 * This middleware should be used after the authenticate middleware
 */
export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user exists in request (added by authenticate middleware)
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user has the required role
    const userRole = (req.user as any).role || UserRole.USER;
    
    if (!allowedRoles.includes(userRole as UserRole)) {
      res.status(403).json({ error: 'Access denied: insufficient permissions' });
      return;
    }

    next();
  };
}; 
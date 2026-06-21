import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';

declare global {
  namespace Express { interface Request { user?: { userId: string; role: Role } } }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = verifyToken(header.slice(7));
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Expired token' });
    return res.status(401).json({ message: 'Invalid token' });
  }
}
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Role mismatch' });
    next();
  };
}

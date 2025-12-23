import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  const headers = (req as any).headers;

  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    try {
      token = headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
      
      // Sequelize uses findByPk for ID lookups
      const user = await (User as any).findByPk(decoded.id);
      
      if (!user) {
          throw new Error('User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
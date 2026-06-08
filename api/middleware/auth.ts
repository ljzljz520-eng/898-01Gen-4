import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hardware-qa-secret-key';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    username: string;
    isVerified: boolean;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      isVerified: boolean;
    };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      isVerified: decoded.isVerified
    };
    next();
  } catch (_error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        username: string;
        isVerified: boolean;
      };
      req.userId = decoded.userId;
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        isVerified: decoded.isVerified
      };
    } catch (_error) {
      // Token 无效，继续作为匿名用户
    }
  }
  next();
}

export function generateToken(user: { id: number; username: string; isVerified: boolean }): string {
  return jwt.sign(
    { userId: user.id, username: user.username, isVerified: user.isVerified },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

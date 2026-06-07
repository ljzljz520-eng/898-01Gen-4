import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { run, get } from '../db/index';
import { authMiddleware, generateToken, AuthRequest } from '../middleware/auth';
import { User } from '../../shared/types';

const router = Router();

router.post('/register', async (req, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    const existingUser = await get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const user = await get<User>(
      'SELECT id, username, email, is_verified as isVerified, created_at as createdAt FROM users WHERE id = ?',
      [userId]
    );

    const token = generateToken({
      id: user!.id,
      username: user!.username,
      isVerified: user!.isVerified
    });

    res.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: '请填写用户名/邮箱和密码' });
    }

    const user = await get<{ id: number; username: string; email: string; password_hash: string; is_verified: boolean; created_at: string }>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [loginIdentifier, loginIdentifier]
    );

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      isVerified: user.is_verified
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await get<User>(
      'SELECT id, username, email, is_verified as isVerified, created_at as createdAt FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;

import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { run, get, all } from '../db/index';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import { Question, Attachment } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const router = Router();

function getFileType(filename: string): 'schematic' | 'firmware' | 'photo' | 'other' {
  const ext = path.extname(filename).toLowerCase();
  if (['.pdf', '.sch', '.brd'].includes(ext)) return 'schematic';
  if (['.bin', '.hex', '.elf', '.ino'].includes(ext)) return 'firmware';
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'photo';
  return 'other';
}

router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'all') {
      whereClause += ' AND q.hardware_type = ?';
      params.push(category);
    }

    if (status && status !== 'all') {
      whereClause += ' AND q.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (q.title LIKE ? OR q.description LIKE ? OR q.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const questions = await all<any>(
      `SELECT q.*, u.username, u.is_verified as userVerified
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       ${whereClause}
       ORDER BY q.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const countResult = await get<any>(
      `SELECT COUNT(*) as total FROM questions q ${whereClause}`,
      params
    );

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      userId: q.user_id,
      title: q.title,
      description: q.description,
      hardwareType: q.hardware_type,
      firmwareVersion: q.firmware_version,
      tags: JSON.parse(q.tags || '[]'),
      status: q.status,
      answerCount: q.answer_count,
      viewCount: q.view_count,
      acceptedAnswerId: q.accepted_answer_id,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      user: {
        id: q.user_id,
        username: q.username,
        isVerified: q.userVerified
      }
    }));

    res.json({
      data: formattedQuestions,
      total: countResult?.total || 0,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: '获取问题列表失败' });
  }
});

router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await run('UPDATE questions SET view_count = view_count + 1 WHERE id = ?', [id]);

    const question = await get<any>(
      `SELECT q.*, u.username, u.email, u.is_verified as userVerified
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`,
      [id]
    );

    if (!question) {
      return res.status(404).json({ error: '问题不存在' });
    }

    const attachments = await all<Attachment>(
      'SELECT * FROM attachments WHERE question_id = ?',
      [id]
    );

    const formattedQuestion: Question = {
      id: question.id,
      userId: question.user_id,
      title: question.title,
      description: question.description,
      hardwareType: question.hardware_type,
      firmwareVersion: question.firmware_version,
      tags: JSON.parse(question.tags || '[]'),
      status: question.status,
      answerCount: question.answer_count,
      viewCount: question.view_count + 1,
      acceptedAnswerId: question.accepted_answer_id,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
      user: {
        id: question.user_id,
        username: question.username,
        email: question.email,
        isVerified: question.userVerified,
        createdAt: question.created_at
      },
      attachments
    };

    res.json({ data: formattedQuestion });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: '获取问题详情失败' });
  }
});

router.post('/', authMiddleware, upload.array('attachments', 10), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, hardwareType, firmwareVersion, tags, license } = req.body;

    if (!title || !description || !hardwareType || !license) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags || [];

    const questionId = await run(
      `INSERT INTO questions (user_id, title, description, hardware_type, firmware_version, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, title, description, hardwareType, firmwareVersion || null, JSON.stringify(tagsArray)]
    );

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        await run(
          `INSERT INTO attachments (question_id, filename, original_name, file_type, file_size, license)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [questionId, file.filename, file.originalname, getFileType(file.originalname), file.size, license]
        );
      }
    }

    const question = await get<Question>(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );

    res.status(201).json({ data: question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: '创建问题失败' });
  }
});

router.get('/:id/answers', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const answers = await all<any>(
      `SELECT a.*, u.username, u.is_verified as userVerified
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ?
       ORDER BY a.is_accepted DESC, a.vote_count DESC, a.created_at ASC`,
      [id]
    );

    const formattedAnswers = await Promise.all(answers.map(async (a) => {
      const attachments = await all<Attachment>(
        'SELECT * FROM attachments WHERE answer_id = ?',
        [a.id]
      );

      return {
        id: a.id,
        questionId: a.question_id,
        userId: a.user_id,
        content: a.content,
        isVerified: a.is_verified,
        verifiedBy: a.verified_by,
        isAccepted: a.is_accepted,
        voteCount: a.vote_count,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        user: {
          id: a.user_id,
          username: a.username,
          isVerified: a.userVerified
        },
        attachments
      };
    }));

    res.json({ data: formattedAnswers });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ error: '获取回答列表失败' });
  }
});

router.post('/:id/answers', authMiddleware, upload.array('attachments', 5), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isVerified, license } = req.body;

    if (!content) {
      return res.status(400).json({ error: '请填写回答内容' });
    }

    const question = await get('SELECT * FROM questions WHERE id = ?', [id]);
    if (!question) {
      return res.status(404).json({ error: '问题不存在' });
    }

    const answerId = await run(
      `INSERT INTO answers (question_id, user_id, content, is_verified, verified_by)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.userId, content, isVerified === 'true' || isVerified === true, isVerified === 'true' || isVerified === true ? req.userId : null]
    );

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      for (const file of files) {
        await run(
          `INSERT INTO attachments (answer_id, filename, original_name, file_type, file_size, license)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [answerId, file.filename, file.originalname, getFileType(file.originalname), file.size, license || 'cc-by-sa-4.0']
        );
      }
    }

    await run('UPDATE questions SET answer_count = answer_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    const answer = await get<any>(
      `SELECT a.*, u.username, u.is_verified as userVerified
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [answerId]
    );

    res.status(201).json({
      data: {
        id: answer.id,
        questionId: answer.question_id,
        userId: answer.user_id,
        content: answer.content,
        isVerified: answer.is_verified,
        verifiedBy: answer.verified_by,
        isAccepted: answer.is_accepted,
        voteCount: answer.vote_count,
        createdAt: answer.created_at,
        updatedAt: answer.updated_at,
        user: {
          id: answer.user_id,
          username: answer.username,
          isVerified: answer.userVerified
        }
      }
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ error: '提交回答失败' });
  }
});

export default router;

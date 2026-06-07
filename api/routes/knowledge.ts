import { Router, Response } from 'express';
import { all, get } from '../db/index';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'all') {
      whereClause += ' AND ke.hardware_type = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (ke.title LIKE ? OR ke.summary LIKE ? OR ke.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const entries = await all<any>(
      `SELECT ke.*, q.created_at as question_created_at
       FROM knowledge_entries ke
       LEFT JOIN questions q ON ke.question_id = q.id
       ${whereClause}
       ORDER BY ke.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const countResult = await get<any>(
      `SELECT COUNT(*) as total FROM knowledge_entries ke ${whereClause}`,
      params
    );

    const formattedEntries = entries.map(ke => ({
      id: ke.id,
      questionId: ke.question_id,
      answerId: ke.answer_id,
      title: ke.title,
      summary: ke.summary,
      tags: JSON.parse(ke.tags || '[]'),
      hardwareType: ke.hardware_type,
      createdAt: ke.created_at
    }));

    res.json({
      data: formattedEntries,
      total: countResult?.total || 0,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Get knowledge entries error:', error);
    res.status(500).json({ error: '获取知识库列表失败' });
  }
});

router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await get<any>(
      `SELECT ke.*, q.*, a.*,
              uq.username as question_username, uq.is_verified as question_verified,
              ua.username as answer_username, ua.is_verified as answer_verified
       FROM knowledge_entries ke
       LEFT JOIN questions q ON ke.question_id = q.id
       LEFT JOIN answers a ON ke.answer_id = a.id
       LEFT JOIN users uq ON q.user_id = uq.id
       LEFT JOIN users ua ON a.user_id = ua.id
       WHERE ke.id = ?`,
      [id]
    );

    if (!entry) {
      return res.status(404).json({ error: '知识条目不存在' });
    }

    const questionAttachments = await all<any>(
      'SELECT * FROM attachments WHERE question_id = ?',
      [entry.question_id]
    );

    const answerAttachments = await all<any>(
      'SELECT * FROM attachments WHERE answer_id = ?',
      [entry.answer_id]
    );

    res.json({
      data: {
        id: entry.id,
        questionId: entry.question_id,
        answerId: entry.answer_id,
        title: entry.title,
        summary: entry.summary,
        tags: JSON.parse(entry.tags || '[]'),
        hardwareType: entry.hardware_type,
        createdAt: entry.created_at,
        question: {
          id: entry.question_id,
          userId: entry.user_id,
          title: entry.title,
          description: entry.description,
          hardwareType: entry.hardware_type,
          firmwareVersion: entry.firmware_version,
          tags: JSON.parse(entry.tags || '[]'),
          status: entry.status,
          answerCount: entry.answer_count,
          viewCount: entry.view_count,
          createdAt: entry.created_at,
          user: {
            id: entry.user_id,
            username: entry.question_username,
            isVerified: entry.question_verified
          },
          attachments: questionAttachments
        },
        answer: {
          id: entry.answer_id,
          questionId: entry.question_id,
          userId: entry.user_id,
          content: entry.content,
          isVerified: entry.is_verified,
          verifiedBy: entry.verified_by,
          isAccepted: entry.is_accepted,
          voteCount: entry.vote_count,
          createdAt: entry.created_at,
          user: {
            id: entry.user_id,
            username: entry.answer_username,
            isVerified: entry.answer_verified
          },
          attachments: answerAttachments
        }
      }
    });
  } catch (error) {
    console.error('Get knowledge entry error:', error);
    res.status(500).json({ error: '获取知识详情失败' });
  }
});

export default router;

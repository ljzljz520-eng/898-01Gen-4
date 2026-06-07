import { Router, Response } from 'express';
import { run, get } from '../db/index';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/:id/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const answer = await get<any>('SELECT * FROM answers WHERE id = ?', [id]);
    if (!answer) {
      return res.status(404).json({ error: '回答不存在' });
    }

    const question = await get<any>('SELECT * FROM questions WHERE id = ?', [answer.question_id]);
    if (!question) {
      return res.status(404).json({ error: '问题不存在' });
    }

    if (question.user_id !== req.userId) {
      return res.status(403).json({ error: '只有问题发布者才能采纳回答' });
    }

    if (question.accepted_answer_id) {
      return res.status(400).json({ error: '该问题已有已采纳的回答' });
    }

    await run('UPDATE answers SET is_accepted = 1 WHERE id = ?', [id]);
    await run('UPDATE questions SET accepted_answer_id = ?, status = ? WHERE id = ?', [id, 'solved', answer.question_id]);

    await run(
      `INSERT INTO knowledge_entries (question_id, answer_id, title, summary, tags, hardware_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        answer.question_id,
        id,
        question.title,
        answer.content.substring(0, 500),
        question.tags,
        question.hardware_type
      ]
    );

    res.json({ success: true, message: '回答已采纳，已加入知识库' });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ error: '采纳回答失败' });
  }
});

router.post('/:id/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (!req.user?.isVerified) {
      return res.status(403).json({ error: '只有认证开发者才能标记验证状态' });
    }

    const answer = await get<any>('SELECT * FROM answers WHERE id = ?', [id]);
    if (!answer) {
      return res.status(404).json({ error: '回答不存在' });
    }

    await run(
      'UPDATE answers SET is_verified = ?, verified_by = ? WHERE id = ?',
      [isVerified ? 1 : 0, isVerified ? req.userId : null, id]
    );

    const updatedAnswer = await get<any>(
      `SELECT a.*, u.username, u.is_verified as userVerified
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    res.json({
      data: {
        id: updatedAnswer.id,
        questionId: updatedAnswer.question_id,
        userId: updatedAnswer.user_id,
        content: updatedAnswer.content,
        isVerified: updatedAnswer.is_verified,
        verifiedBy: updatedAnswer.verified_by,
        isAccepted: updatedAnswer.is_accepted,
        voteCount: updatedAnswer.vote_count,
        createdAt: updatedAnswer.created_at,
        updatedAt: updatedAnswer.updated_at,
        user: {
          id: updatedAnswer.user_id,
          username: updatedAnswer.username,
          isVerified: updatedAnswer.userVerified
        }
      }
    });
  } catch (error) {
    console.error('Verify answer error:', error);
    res.status(500).json({ error: '标记验证状态失败' });
  }
});

router.post('/:id/vote', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (![1, -1].includes(Number(direction))) {
      return res.status(400).json({ error: '无效的投票方向' });
    }

    const answer = await get<any>('SELECT * FROM answers WHERE id = ?', [id]);
    if (!answer) {
      return res.status(404).json({ error: '回答不存在' });
    }

    const existingVote = await get<any>(
      'SELECT * FROM votes WHERE answer_id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (existingVote) {
      if (existingVote.direction === Number(direction)) {
        await run('DELETE FROM votes WHERE id = ?', [existingVote.id]);
        await run('UPDATE answers SET vote_count = vote_count - ? WHERE id = ?', [Number(direction), id]);
      } else {
        await run('UPDATE votes SET direction = ? WHERE id = ?', [Number(direction), existingVote.id]);
        await run('UPDATE answers SET vote_count = vote_count + ? WHERE id = ?', [Number(direction) * 2, id]);
      }
    } else {
      await run('INSERT INTO votes (answer_id, user_id, direction) VALUES (?, ?, ?)', [id, req.userId, Number(direction)]);
      await run('UPDATE answers SET vote_count = vote_count + ? WHERE id = ?', [Number(direction), id]);
    }

    const updatedAnswer = await get<any>(
      `SELECT a.*, u.username, u.is_verified as userVerified
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    res.json({
      data: {
        id: updatedAnswer.id,
        questionId: updatedAnswer.question_id,
        userId: updatedAnswer.user_id,
        content: updatedAnswer.content,
        isVerified: updatedAnswer.is_verified,
        verifiedBy: updatedAnswer.verified_by,
        isAccepted: updatedAnswer.is_accepted,
        voteCount: updatedAnswer.vote_count,
        createdAt: updatedAnswer.created_at,
        updatedAt: updatedAnswer.updated_at,
        user: {
          id: updatedAnswer.user_id,
          username: updatedAnswer.username,
          isVerified: updatedAnswer.userVerified
        }
      }
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ error: '投票失败' });
  }
});

export default router;

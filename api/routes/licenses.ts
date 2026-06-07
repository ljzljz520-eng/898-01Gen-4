import { Router, Response } from 'express';
import { licenses } from '../licenses';

const router = Router();

router.get('/', (req, res: Response) => {
  res.json({ data: licenses });
});

router.get('/:id', (req, res: Response) => {
  const { id } = req.params;
  const license = licenses.find(l => l.id === id);

  if (!license) {
    return res.status(404).json({ error: '许可证不存在' });
  }

  res.json({ data: license });
});

export default router;

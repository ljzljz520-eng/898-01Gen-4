import { Router, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { run, get } from '../db/index';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import { getLicenseById } from '../licenses';
import { Attachment } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

const router = Router();

router.get('/:id/license', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const attachment = await get<Attachment>('SELECT * FROM attachments WHERE id = ?', [id]);
    if (!attachment) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const license = getLicenseById(attachment.license);
    if (!license) {
      return res.status(404).json({ error: '许可证信息不存在' });
    }

    res.json({
      data: {
        attachment: {
          id: attachment.id,
          originalName: attachment.originalName,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          downloadCount: attachment.downloadCount
        },
        license
      }
    });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: '获取许可证信息失败' });
  }
});

router.get('/:id/download', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { confirmed } = req.query;

    const attachment = await get<Attachment>('SELECT * FROM attachments WHERE id = ?', [id]);
    if (!attachment) {
      return res.status(404).json({ error: '附件不存在' });
    }

    const license = getLicenseById(attachment.license);
    if (!license) {
      return res.status(500).json({ error: '许可证信息错误' });
    }

    if (confirmed !== 'true') {
      return res.status(400).json({
        error: '请先确认许可证条款',
        license: {
          name: license.name,
          fullName: license.fullName,
          url: license.url,
          commercialUse: license.commercialUse,
          attributionRequired: license.attributionRequired,
          shareAlike: license.shareAlike,
          description: license.description
        }
      });
    }

    const filePath = path.join(uploadDir, attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    await run('UPDATE attachments SET download_count = download_count + 1 WHERE id = ?', [id]);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.originalName)}"`);
    res.setHeader('X-License', license.name);
    res.setHeader('X-License-Commercial-Use', license.commercialUse ? 'allowed' : 'prohibited');
    res.setHeader('X-License-Attribution-Required', license.attributionRequired ? 'yes' : 'no');
    res.setHeader('X-License-Share-Alike', license.shareAlike ? 'required' : 'not-required');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: '下载失败' });
  }
});

export default router;

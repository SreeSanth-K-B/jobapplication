import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Documents are stored as metadata in MySQL, actual files would go to S3/Cloudinary in production
// For now, we'll store document references with names and types

// GET /api/documents — placeholder for documents vault
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  // TODO: Implement with file storage (S3/Cloudinary)
  res.json({ documents: [], message: 'Documents vault — coming soon with file storage integration' });
});

export default router;

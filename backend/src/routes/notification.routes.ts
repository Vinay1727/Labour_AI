import express from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

export default router;

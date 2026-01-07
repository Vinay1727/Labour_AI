import express from 'express';
import { sendMessage, getChatHistory, getActiveChats } from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/history/:dealId', protect, getChatHistory);
router.get('/active-chats', protect, getActiveChats);

export default router;

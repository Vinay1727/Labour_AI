import express from 'express';
import { unifiedSearch, voiceToSearchQuery } from '../controllers/search.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadVoice } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', protect, unifiedSearch);
router.post('/voice', protect, uploadVoice.single('audio'), voiceToSearchQuery);

export default router;

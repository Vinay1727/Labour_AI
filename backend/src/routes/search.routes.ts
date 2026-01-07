import express from 'express';
import { unifiedSearch } from '../controllers/search.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, unifiedSearch);

export default router;

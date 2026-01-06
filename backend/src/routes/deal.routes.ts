import express from 'express';
import { createDeal, applyForJob } from '../controllers/deal.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';

const router = express.Router();
router.post('/', protect, createDeal);
router.post('/apply', protect, restrictTo('labour'), applyForJob);
export default router;

import express from 'express';
import { createReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();
router.post('/', protect, createReview);
export default router;

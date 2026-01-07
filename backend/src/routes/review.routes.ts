import express from 'express';
import { createReview, getDealReviews } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.post('/', createReview);
router.get('/deal/:dealId', getDealReviews);

export default router;

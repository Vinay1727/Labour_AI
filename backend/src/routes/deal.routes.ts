import express from 'express';
import {
    createDeal,
    applyForJob,
    requestCompletion,
    approveCompletion,
    rejectCompletion,
    updateDealStatus,
    approveApplication,
    getDeal,
    getDeals
} from '../controllers/deal.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';

const router = express.Router();

router.post('/', protect, createDeal);
router.get('/', protect, getDeals);
router.get('/:dealId', protect, getDeal);
router.post('/apply', protect, restrictTo('labour'), applyForJob);

// New Lifecycle Routes
router.post('/approve', protect, restrictTo('contractor'), approveApplication);
router.put('/status', protect, restrictTo('contractor'), updateDealStatus);
router.post('/:dealId/request-completion', protect, restrictTo('labour'), requestCompletion);
router.post('/:dealId/approve-completion', protect, restrictTo('contractor'), approveCompletion);
router.post('/:dealId/reject-completion', protect, restrictTo('contractor'), rejectCompletion);

export default router;

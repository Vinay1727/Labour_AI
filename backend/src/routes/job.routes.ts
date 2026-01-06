import express from 'express';
import { createJob, getJobs } from '../controllers/job.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';

const router = express.Router();

router.post('/', protect, restrictTo('contractor'), createJob);
router.get('/', protect, getJobs);

export default router;

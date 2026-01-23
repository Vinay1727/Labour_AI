import express from 'express';
import {
    createJob,
    getJobs,
    getJobDetails,
    applyToJob,
    handleApplication
} from '../controllers/job.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { uploadJobImages } from '../middleware/upload.middleware';

const router = express.Router();

router.post('/', protect, restrictTo('contractor'), uploadJobImages.array('images', 5), createJob);
router.get('/', protect, getJobs);
router.get('/:jobId', protect, getJobDetails);
router.post('/:jobId/apply', protect, restrictTo('labour'), applyToJob);
router.post('/:jobId/applications/:labourId', protect, restrictTo('contractor'), handleApplication);

export default router;

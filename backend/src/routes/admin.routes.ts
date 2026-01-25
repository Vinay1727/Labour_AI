import express from 'express';
import {
    adminLogin,
    getDashboardStats,
    getLabours,
    getContractors
} from '../controllers/admin.controller';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/dashboard-stats', getDashboardStats);
router.get('/labours', getLabours);
router.get('/contractors', getContractors);

export default router;

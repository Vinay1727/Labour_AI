import express from 'express';
import {
    adminLogin,
    getDashboardStats,
    getLabours,
    getContractors,
    getJobs,
    getActiveDeals,
    getVerificationRequests,
    verifyUser
} from '../controllers/admin.controller';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/dashboard-stats', getDashboardStats);
router.get('/labours', getLabours);
router.get('/contractors', getContractors);
router.get('/jobs', getJobs);
router.get('/deals', getActiveDeals);
router.get('/verification-requests', getVerificationRequests);
router.post('/verify-user', verifyUser);

export default router;

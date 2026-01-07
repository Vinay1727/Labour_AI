import express from 'express';
import {
    submitAttendance,
    verifyAttendance,
    getDealAttendance
} from '../controllers/attendance.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';

const router = express.Router();

router.use(protect);

router.post('/submit', restrictTo('labour'), submitAttendance);
router.post('/verify', restrictTo('contractor'), verifyAttendance);
router.get('/deal/:dealId', getDealAttendance);

export default router;

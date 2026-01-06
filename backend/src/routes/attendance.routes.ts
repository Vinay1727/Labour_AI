import express from 'express';
import { markAttendance } from '../controllers/attendance.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';

const router = express.Router();
router.post('/', protect, restrictTo('labour'), markAttendance);
export default router;

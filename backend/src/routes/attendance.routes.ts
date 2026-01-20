import express from 'express';
import {
    submitAttendance,
    approveAttendance,
    rejectAttendance,
    getDealAttendance
} from '../controllers/attendance.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/role.middleware';
import { uploadAttendanceImage } from '../middleware/upload.middleware';

const router = express.Router();

router.use(protect);

router.post('/submit', restrictTo('labour'), uploadAttendanceImage.single('image'), submitAttendance);
router.patch('/:attendanceId/approve', restrictTo('contractor'), approveAttendance);
router.patch('/:attendanceId/reject', restrictTo('contractor'), rejectAttendance);

// Legacy route to prevent "Route not found" errors
router.post('/verify', restrictTo('contractor'), async (req, res, next) => {
    const { attendanceId, status } = req.body;
    if (status === 'approved') {
        req.params.attendanceId = attendanceId;
        return approveAttendance(req as any, res);
    } else if (status === 'rejected') {
        req.params.attendanceId = attendanceId;
        return rejectAttendance(req as any, res);
    }
    next();
});
router.get('/deal/:dealId', getDealAttendance);

export default router;

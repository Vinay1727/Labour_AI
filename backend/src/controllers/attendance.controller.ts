import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Attendance from '../models/Attendance.model';
import Deal from '../models/Deal.model';
import { success, error } from '../utils/response';
import { calculateLabourRank } from '../services/ranking.service';
import { NotificationService } from '../services/notification.service';

export const submitAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId, location, imageUrl } = req.body;

        const deal = await Deal.findById(dealId);
        if (!deal) return error(res, 'Deal not found', 404);

        if (deal.labourId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        // Check if attendance already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await Attendance.findOne({
            dealId,
            labourId: req.user._id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existing) return error(res, 'Attendance already marked for today', 400);

        const attendance = await Attendance.create({
            dealId,
            labourId: req.user._id,
            date: new Date(),
            location,
            imageUrl,
            status: 'pending'
        });

        // Send Notification to Contractor
        await NotificationService.createNotification({
            userId: deal.contractorId.toString(),
            title: 'Attendance Lagayi Gayi 📍',
            message: `${req.user.name || 'Labour'} ne aaj ki attendance mark kar di hai. Approve karein.`,
            type: 'attendance',
            relatedId: deal._id.toString(),
            route: 'AttendanceHistory'
        });

        success(res, attendance, 'Attendance submitted successfully');
    } catch (e: any) { error(res, e.message); }
};

export const verifyAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { attendanceId, status } = req.body; // status: 'approved' | 'rejected'

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return error(res, 'Attendance not found', 404);

        const deal = await Deal.findById(attendance.dealId);
        if (!deal || deal.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        attendance.status = status;
        await attendance.save();

        if (status === 'approved') {
            await calculateLabourRank((deal.labourId as any));
        }

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: attendance.labourId.toString(),
            title: status === 'approved' ? 'Attendance Approved ✔️' : 'Attendance Rejected ❌',
            message: status === 'approved'
                ? `Aapki aaj ki attendance approve ho gayi hai.`
                : `Aapki attendance reject kar di gayi hai. Contractor se baat karein.`,
            type: 'attendance',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        success(res, attendance, `Attendance ${status}`);
    } catch (e: any) { error(res, e.message); }
};

export const getDealAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const attendance = await Attendance.find({ dealId }).sort({ date: -1 });
        success(res, attendance);
    } catch (e: any) { error(res, e.message); }
};

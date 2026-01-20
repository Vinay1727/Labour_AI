import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Attendance from '../models/Attendance.model';
import Deal from '../models/Deal.model';
import Message from '../models/Message.model';
import { success, error } from '../utils/response';
import { calculateLabourRank } from '../services/ranking.service';
import { NotificationService } from '../services/notification.service';

export const submitAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.body;
        let { location } = req.body;

        if (!req.file) {
            return error(res, 'Attendance image is required', 400);
        }

        const deal = await Deal.findById(dealId);
        if (!deal) return error(res, 'Deal not found', 404);

        if (deal.labourId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        // Handle stringified location if sent from mobile
        if (typeof location === 'string') {
            try {
                location = JSON.parse(location);
            } catch (e) {
                return error(res, 'Invalid location format', 400);
            }
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

        const imageUrl = `uploads/attendance/${req.file.filename}`;
        let attendance;

        if (existing) {
            if (existing.status === 'approved') {
                return error(res, 'Attendance already approved for today', 400);
            }
            if (existing.status === 'pending') {
                return error(res, 'Attendance is already pending approval', 400);
            }

            // If rejected, update existing record to pending
            existing.status = 'pending';
            existing.imageUrl = imageUrl;
            existing.location = location;
            existing.date = new Date();
            await existing.save();
            attendance = existing;
        } else {
            attendance = await Attendance.create({
                dealId,
                jobId: deal.jobId,
                labourId: req.user._id,
                date: new Date(),
                location,
                imageUrl,
                status: 'pending'
            });
        }

        // Create System Message for Chat
        await Message.create({
            dealId,
            senderId: req.user._id,
            receiverId: deal.contractorId,
            message: 'Attendance marked for today',
            messageType: 'attendance_proof',
            imageUrl: attendance.imageUrl,
            location: {
                latitude: (location as any).coordinates[1] || 0,
                longitude: (location as any).coordinates[0] || 0
            },
            attendanceId: attendance._id,
            status: 'pending',
            isRead: false
        });

        // Send Notification to Contractor
        await NotificationService.createNotification({
            userId: deal.contractorId.toString(),
            title: 'Attendance Lagayi Gayi 📍',
            message: `${req.user.name || 'Labour'} ne aaj ki attendance mark kar di hai. Chat me dekh kar approve karein.`,
            type: 'attendance',
            relatedId: deal._id.toString(),
            route: 'Chat'
        });

        success(res, {
            attendanceId: attendance._id,
            imageUrl: attendance.imageUrl,
            location: attendance.location
        }, 'Attendance submitted successfully');
    } catch (e: any) {
        console.error('Submit Attendance Error:', e);
        error(res, e.message);
    }
};

export const approveAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { attendanceId } = req.params;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return error(res, 'Attendance not found', 404);

        const deal = await Deal.findById(attendance.dealId);
        if (!deal || deal.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        attendance.status = 'approved';
        await attendance.save();

        // Update Chat Message status
        await Message.findOneAndUpdate(
            { attendanceId: attendance._id },
            { status: 'approved', message: 'Attendance Approved ✅' }
        );

        await calculateLabourRank((deal.labourId as any));

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: attendance.labourId.toString(),
            title: 'Attendance Approved ✔️',
            message: `Aapki aaj ki attendance approve ho gayi hai.`,
            type: 'attendance',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        success(res, attendance, 'Attendance approved successfully');
    } catch (e: any) { error(res, e.message); }
};

export const rejectAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { attendanceId } = req.params;

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return error(res, 'Attendance not found', 404);

        const deal = await Deal.findById(attendance.dealId);
        if (!deal || deal.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        attendance.status = 'rejected';
        await attendance.save();

        // Update Chat Message status
        await Message.findOneAndUpdate(
            { attendanceId: attendance._id },
            { status: 'rejected', message: 'Attendance Rejected ❌' }
        );

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: attendance.labourId.toString(),
            title: 'Attendance Rejected ❌',
            message: `Aapki attendance reject kar di gayi hai. Contractor se baat karein.`,
            type: 'attendance',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        success(res, attendance, 'Attendance rejected successfully');
    } catch (e: any) { error(res, e.message); }
};

export const getDealAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const attendance = await Attendance.find({ dealId }).sort({ date: -1 });
        success(res, attendance);
    } catch (e: any) { error(res, e.message); }
};

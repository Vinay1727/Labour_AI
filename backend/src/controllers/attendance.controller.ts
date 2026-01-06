import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Attendance from '../models/Attendance.model';
import { success, error } from '../utils/response';

export const markAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const attendance = await Attendance.create({ ...req.body, labourId: req.user._id });
        success(res, attendance, 'Attendance marked');
    } catch (e: any) { error(res, e.message); }
};

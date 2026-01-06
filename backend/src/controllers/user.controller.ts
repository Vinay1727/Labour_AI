import { Response } from 'express';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        success(res, user, 'Profile updated');
    } catch (e: any) {
        error(res, e.message);
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    success(res, req.user);
};

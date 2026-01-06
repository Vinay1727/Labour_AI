import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Review from '../models/Review.model';
import { success, error } from '../utils/response';

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const review = await Review.create({ ...req.body, reviewerId: req.user._id });
        success(res, review, 'Review created');
    } catch (e: any) { error(res, e.message); }
};

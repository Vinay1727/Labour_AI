import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Review from '../models/Review.model';
import User from '../models/User.model';
import { success, error } from '../utils/response';
import { calculateLabourRank } from '../services/ranking.service';

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId, reviewedUserId, rating, comment } = req.body;

        // Check if review already exists
        const existing = await Review.findOne({ dealId, reviewerId: req.user._id });
        if (existing) {
            return error(res, 'You have already reviewed this deal', 400);
        }

        const review = await Review.create({
            dealId,
            reviewerId: req.user._id,
            reviewedUserId,
            rating,
            comment
        });

        // Update Reviewee's average rating
        const user = await User.findById(reviewedUserId);
        if (user) {
            const currentTotalStars = (user.averageRating || 0) * (user.reviewCount || 0);
            const newTotalCount = (user.reviewCount || 0) + 1;
            const newAverage = (currentTotalStars + rating) / newTotalCount;

            user.averageRating = Number(newAverage.toFixed(1));
            user.reviewCount = newTotalCount;
            await user.save();

            // Recalculate Labour Rank on new review
            if (user.role === 'labour') {
                await calculateLabourRank(user._id);
            }
        }

        success(res, review, 'Review submitted successfully');
    } catch (e: any) {
        console.error('Create Review Error:', e);
        error(res, e.message);
    }
};

export const getDealReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const reviews = await Review.find({ dealId });
        success(res, reviews);
    } catch (e: any) {
        error(res, e.message);
    }
};

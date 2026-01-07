import { Response } from 'express';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import Job from '../models/Job.model';
import User from '../models/User.model';

/**
 * Unified Search Endpoint
 * GET /api/search
 */
export const unifiedSearch = async (req: AuthRequest, res: Response) => {
    try {
        const { q, lat, lng, distance = 25, skill, paymentType, rating } = req.query;
        const role = req.user.role;

        const filter: any = {};
        const parsedLat = lat ? parseFloat(lat as string) : NaN;
        const parsedLng = lng ? parseFloat(lng as string) : NaN;
        const parsedDist = parseInt(distance as string) || 25;

        // Common search query logic
        let searchFilter: any = null;
        if (q) {
            const escapedQ = (q as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            searchFilter = new RegExp(escapedQ, 'i');
        }

        // Location Logic
        const hasLocation = !isNaN(parsedLat) && !isNaN(parsedLng);
        if (hasLocation) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    $maxDistance: parsedDist * 1000
                }
            };
        }

        if (role === 'labour') {
            filter.status = 'open';
            filter['applications.labourId'] = { $ne: req.user._id };

            if (skill) {
                filter.workType = skill;
            } else if (!q) {
                if (req.user.skills && req.user.skills.length > 0) {
                    filter.workType = { $in: req.user.skills };
                } else {
                    filter.workType = 'helper';
                }
            }

            if (paymentType) filter.paymentType = paymentType;

            if (searchFilter) {
                filter.$or = [
                    { workType: searchFilter },
                    { description: searchFilter },
                    { 'location.address': searchFilter }
                ];
            }

            let query = Job.find(filter).populate('contractorId', 'name phone averageRating');
            if (!hasLocation) {
                query = query.sort({ createdAt: -1 });
            }

            const jobs = await query.limit(50);
            return success(res, { type: 'jobs', results: jobs });

        } else if (role === 'contractor') {
            filter.role = 'labour';
            if (skill) filter.skills = skill;
            if (rating) filter.averageRating = { $gte: parseFloat(rating as string) || 0 };

            if (searchFilter) {
                filter.$or = [
                    { name: searchFilter },
                    { skills: searchFilter }
                ];
            }

            let query = User.find(filter).select('name phone averageRating reviewCount skills location');
            if (!hasLocation) {
                query = query.sort({ averageRating: -1 });
            }

            const labours = await query.limit(50);
            return success(res, { type: 'labours', results: labours });
        }

        return error(res, 'User role not recognized for search');
    } catch (e: any) {
        console.error('Unified Search Error Details:', e);
        error(res, `Search failed: ${e.message}`, 500);
    }
};

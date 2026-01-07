import { Response } from 'express';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import Deal from '../models/Deal.model';
import Attendance from '../models/Attendance.model';
import Review from '../models/Review.model';

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

export const searchLabours = async (req: AuthRequest, res: Response) => {
    try {
        const { q, lat, lng, distance = 25, skill, rating, availability } = req.query;
        const filter: any = { role: 'labour' };

        if (skill) filter.skills = skill;
        if (rating) filter.averageRating = { $gte: parseFloat(rating as string) };

        if (q) {
            const searchRegex = new RegExp(q as string, 'i');
            filter.$or = [
                { name: searchRegex },
                { skills: searchRegex }
            ];
        }

        if (lat && lng) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
                    },
                    $maxDistance: parseInt(distance as string) * 1000
                }
            };
        }

        const labours = await User.find(filter)
            .select('name phone averageRating reviewCount skills location rank')
            .limit(50);

        success(res, labours);
    } catch (e: any) { error(res, e.message); }
};

export const getSkillInsights = async (req: AuthRequest, res: Response) => {
    try {
        const { lat, lng, distance = 10 } = req.query;
        const pipeline: any[] = [];

        if (lat && lng) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
                    },
                    distanceField: 'dist.calculated',
                    maxDistance: parseInt(distance as string) * 1000,
                    query: { role: 'labour' },
                    spherical: true
                }
            });
        } else {
            pipeline.push({ $match: { role: 'labour' } });
        }

        pipeline.push(
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        );

        const results = await User.aggregate(pipeline);
        success(res, results);
    } catch (e: any) {
        console.error('Skill Insights Error:', e);
        error(res, e.message, 500);
    }
};

export const getLabourDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const labour = await User.findById(id).select('-password');
        if (!labour || labour.role !== 'labour') {
            return error(res, 'Labour not found', 404);
        }

        const deals = await Deal.find({ labourId: id });
        const totalDeals = deals.length;
        const completedDeals = deals.filter(d => d.status === 'completed').length;
        const cancelledDeals = deals.filter(d => d.status === 'rejected').length;
        const reliabilityScore = totalDeals > 0
            ? Math.round(((completedDeals - (cancelledDeals * 0.5)) / totalDeals) * 100)
            : 100;

        const attendanceCount = await Attendance.countDocuments({ labourId: id });
        const attendanceScore = totalDeals > 0
            ? Math.min(Math.round((attendanceCount / (completedDeals || 1)) * 100), 100)
            : 0;

        const contractors = deals.map(d => d.contractorId.toString());
        const uniqueContractors = new Set(contractors).size;
        const repeatHires = totalDeals - uniqueContractors;
        const repeatHireRate = totalDeals > 0 ? Math.round((repeatHires / totalDeals) * 100) : 0;

        const skillExpRes = await Deal.aggregate([
            { $match: { labourId: labour._id, status: 'completed' } },
            { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
            { $unwind: '$job' },
            { $group: { _id: '$job.workType', count: { $sum: 1 } } }
        ]);

        const areasRes = await Deal.aggregate([
            { $match: { labourId: labour._id } },
            { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
            { $unwind: '$job' },
            { $match: { 'job.location.area': { $exists: true } } },
            { $group: { _id: '$job.location.area' } },
            { $limit: 5 }
        ]);

        const recentReviews = await Review.find({ reviewedUserId: id })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('reviewerId', 'name');

        const behaviourTags = [];
        if (reliabilityScore > 90) behaviourTags.push('Time par aata hai');
        if (repeatHireRate > 20) behaviourTags.push('Bharosemand');
        if (completedDeals > 10) behaviourTags.push('Experienced');
        if (attendanceScore > 90) behaviourTags.push('Disciplined');

        const details = {
            ...labour.toObject(),
            trustSignals: {
                reliabilityScore: Math.max(reliabilityScore, 0),
                attendanceScore,
                repeatHireRate,
                skillExperience: skillExpRes,
                areaFamiliarity: areasRes.map(a => a._id),
                behaviourTags,
                joinedDate: labour.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
                jobsCompleted: completedDeals,
                recentReviews: recentReviews.map(r => ({
                    reviewer: (r.reviewerId as any).name,
                    rating: r.rating,
                    comment: r.comment
                }))
            }
        };

        success(res, details);
    } catch (e: any) {
        console.error('Get Labour Details Error:', e);
        error(res, e.message);
    }
};

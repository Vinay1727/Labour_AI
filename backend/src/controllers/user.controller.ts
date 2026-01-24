import { Response } from 'express';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User.model';
import Deal from '../models/Deal.model';
import Attendance from '../models/Attendance.model';
import Review from '../models/Review.model';

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        // Prevent direct phone update via profile update
        const { phone, ...updateData } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
        success(res, user, 'Profile updated');
    } catch (e: any) {
        error(res, e.message);
    }
};

export const requestPhoneChange = async (req: AuthRequest, res: Response) => {
    try {
        const { newPhone } = req.body;
        if (!newPhone) return error(res, 'New phone number is required', 400);

        // Check if phone already in use
        const existingUser = await User.findOne({ phone: newPhone });
        if (existingUser) return error(res, 'This phone number is already registered', 400);

        const otp = '1234'; // Mock OTP
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await User.findByIdAndUpdate(req.user.id, {
            pendingPhone: newPhone,
            phoneUpdateOTP: otp,
            phoneUpdateOTPExpire: otpExpire
        });

        success(res, { otp }, 'OTP sent to new number');
    } catch (e: any) {
        error(res, e.message);
    }
};

export const verifyPhoneChange = async (req: AuthRequest, res: Response) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.phoneUpdateOTP) {
            return error(res, 'No pending phone change request', 400);
        }

        if (user.phoneUpdateOTP !== otp) {
            return error(res, 'Invalid OTP', 400);
        }

        if (user.phoneUpdateOTPExpire && user.phoneUpdateOTPExpire < new Date()) {
            return error(res, 'OTP expired', 400);
        }

        const newPhone = user.pendingPhone;
        user.phone = newPhone!;
        user.pendingPhone = undefined;
        user.phoneUpdateOTP = undefined;
        user.phoneUpdateOTPExpire = undefined;
        await user.save();

        success(res, user, 'Phone number updated successfully');
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
            const results = await User.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
                        },
                        distanceField: 'distance',
                        maxDistance: parseInt(distance as string) * 1000,
                        query: filter,
                        spherical: true
                    }
                },
                {
                    $project: {
                        name: 1, phone: 1, averageRating: 1, reviewCount: 1, skills: 1, location: 1, rank: 1, distance: 1
                    }
                },
                { $limit: 50 }
            ]);
            return success(res, results);
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

        const parsedLat = (lat !== undefined && lat !== null) ? parseFloat(lat as string) : NaN;
        const parsedLng = (lng !== undefined && lng !== null) ? parseFloat(lng as string) : NaN;
        const parsedDist = parseInt(distance as string) || 10;

        const hasLocation = !isNaN(parsedLat) && !isNaN(parsedLng) &&
            parsedLat >= -90 && parsedLat <= 90 &&
            parsedLng >= -180 && parsedLng <= 180;

        if (hasLocation) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    distanceField: 'dist.calculated',
                    maxDistance: (parsedDist || 10) * 1000,
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

        console.log('Skill Insights Pipeline:', JSON.stringify(pipeline, null, 2));
        const results = await User.aggregate(pipeline);

        // Fallback: If no insights near the user, show global skill insights
        if (results.length === 0 && hasLocation) {
            console.log('[Insights] No local data, showing global skill stats');
            const globalPipeline = [
                { $match: { role: 'labour' } },
                { $unwind: '$skills' },
                { $group: { _id: '$skills', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ];
            const globalResults = await User.aggregate(globalPipeline);
            return success(res, globalResults);
        }

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
                joinedDate: labour.createdAt ? labour.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recent',
                jobsCompleted: completedDeals,
                recentReviews: recentReviews.map(r => ({
                    reviewer: (r.reviewerId as any)?.name || 'User',
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

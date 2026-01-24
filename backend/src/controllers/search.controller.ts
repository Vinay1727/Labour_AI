import { Response } from 'express';
import mongoose from 'mongoose';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import Job from '../models/Job.model';
import User from '../models/User.model';

export const unifiedSearch = async (req: AuthRequest, res: Response) => {
    try {
        const { q, lat, lng, distance = 25, skill, paymentType, rating } = req.query;

        if (!req.user || !req.user._id) {
            return error(res, 'User not authenticated', 401);
        }

        const userId = new mongoose.Types.ObjectId(req.user._id);
        const role = req.user.role || 'labour';

        const parsedLat = parseFloat(lat as string);
        const parsedLng = parseFloat(lng as string);
        const parsedDist = parseInt(distance as string) || 25;

        const hasLocation = !isNaN(parsedLat) && !isNaN(parsedLng);

        // matchCriteria for filtering results
        const matchCriteria: any = {};

        if (q && typeof q === 'string' && q.trim()) {
            const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escapedQ, 'i');

            if (role === 'labour') {
                matchCriteria.$or = [
                    { workType: searchRegex },
                    { description: searchRegex }
                ];
            } else {
                matchCriteria.$or = [
                    { name: searchRegex },
                    { skills: searchRegex }
                ];
            }
        }

        const pipeline: any[] = [];

        if (role === 'labour') {
            matchCriteria.status = 'open';
            matchCriteria['applications.labourId'] = { $ne: userId };
            if (skill) matchCriteria.workType = skill;
            if (paymentType) matchCriteria.paymentType = paymentType;

            if (hasLocation) {
                pipeline.push({
                    $geoNear: {
                        near: { type: 'Point', coordinates: [parsedLng, parsedLat] },
                        distanceField: 'distance',
                        query: matchCriteria, // Apply non-geo filters here
                        spherical: true,
                        maxDistance: parsedDist * 1000
                    }
                });
                pipeline.push({ $sort: { distance: 1, createdAt: -1 } }); // Sort by distance then creation date
            } else {
                pipeline.push({ $match: matchCriteria });
                pipeline.push({ $sort: { createdAt: -1 } });
            }

            // Populate contractor manually via lookup
            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'contractorId',
                    foreignField: '_id',
                    as: 'contractorInfo'
                }
            });
            pipeline.push({ $unwind: { path: '$contractorInfo', preserveNullAndEmptyArrays: true } });
            pipeline.push({
                $project: {
                    _id: 1, workType: 1, description: 1, paymentAmount: 1, paymentType: 1,
                    location: 1, status: 1, createdAt: 1, distance: 1,
                    contractorId: {
                        _id: '$contractorInfo._id',
                        name: '$contractorInfo.name',
                        phone: '$contractorInfo.phone',
                        averageRating: '$contractorInfo.averageRating'
                    }
                }
            });
        } else {
            matchCriteria.role = 'labour';
            if (skill) matchCriteria.skills = skill;
            if (rating) matchCriteria.averageRating = { $gte: parseFloat(rating as string) || 0 };

            if (hasLocation) {
                pipeline.push({
                    $geoNear: {
                        near: { type: 'Point', coordinates: [parsedLng, parsedLat] },
                        distanceField: 'distance',
                        query: matchCriteria, // Apply non-geo filters here
                        spherical: true,
                        maxDistance: parsedDist * 1000
                    }
                });
                pipeline.push({ $sort: { distance: 1, averageRating: -1 } }); // Sort by distance then rating
            } else {
                pipeline.push({ $match: matchCriteria });
                pipeline.push({ $sort: { averageRating: -1 } });
            }

            pipeline.push({
                $project: {
                    name: 1, phone: 1, averageRating: 1, reviewCount: 1, skills: 1, location: 1, rank: 1, distance: 1
                }
            });
        }

        pipeline.push({ $limit: 50 });

        const results = role === 'labour'
            ? await Job.aggregate(pipeline)
            : await User.aggregate(pipeline);

        // FALLBACK: If nothing found within the distance, show global results to avoid empty screen
        if (results.length === 0 && !q && !skill) {
            if (role === 'labour') {
                const globalJobs = await Job.find({ status: 'open' })
                    .populate('contractorId', 'name phone averageRating')
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean();
                return success(res, { type: 'jobs', results: globalJobs });
            } else {
                const globalLabours = await User.find({ role: 'labour' })
                    .select('name phone averageRating reviewCount skills location rank')
                    .sort({ averageRating: -1 })
                    .limit(20)
                    .lean();
                return success(res, { type: 'labours', results: globalLabours });
            }
        }

        return success(res, { type: role === 'labour' ? 'jobs' : 'labours', results });
    } catch (e: any) {
        console.error('Search Critical Error:', e);
        // Clean fallback to ensure frontend is never empty
        const fallbackRole = req.user?.role || 'labour';
        const results = fallbackRole === 'labour'
            ? await Job.find({ status: 'open' }).limit(10).populate('contractorId', 'name phone averageRating').lean()
            : await User.find({ role: 'labour' }).limit(10).select('name phone averageRating skills location').sort({ averageRating: -1 }).lean();

        return success(res, { type: fallbackRole === 'labour' ? 'jobs' : 'labours', results });
    }
};

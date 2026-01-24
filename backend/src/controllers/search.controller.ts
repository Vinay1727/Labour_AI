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
                }
            };

            // Only apply strict distance limit if searching for something specific 
            // OR if it's a labourer looking for nearby jobs.
            // For contractors just browsing, show the nearest labourers even if they are far.
            if (q || skill || role === 'labour' || parsedDist !== 100) {
                filter.location.$near.$maxDistance = parsedDist * 1000;
            }
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

            // Using aggregation for contractors to always get distance and be more lenient
            const pipeline: any[] = [];

            if (hasLocation) {
                const geoNear: any = {
                    near: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    distanceField: 'distance',
                    query: filter,
                    spherical: true
                };

                // Only apply maxDistance if the user is searching for something specific 
                // OR if they have set the distance filter to something other than the default/max
                if (q || skill || (parsedDist > 0 && parsedDist < 100)) {
                    geoNear.maxDistance = parsedDist * 1000;
                }

                pipeline.push({ $geoNear: geoNear });
            } else {
                pipeline.push({ $match: filter });
                pipeline.push({ $sort: { averageRating: -1 } });
            }

            pipeline.push({
                $project: {
                    name: 1, phone: 1, averageRating: 1, reviewCount: 1, skills: 1, location: 1, rank: 1, distance: 1
                }
            });
            pipeline.push({ $limit: 50 });

            const labours = await User.aggregate(pipeline);

            // If we found nothing with filters, let's at least show some labourers globally to the contractor
            if (labours.length === 0 && !q && !skill) {
                const globalLabours = await User.find({ role: 'labour' })
                    .select('name phone averageRating reviewCount skills location rank')
                    .limit(20)
                    .sort({ averageRating: -1 });
                return success(res, { type: 'labours', results: globalLabours });
            }

            return success(res, { type: 'labours', results: labours });
        }

        return error(res, 'User role not recognized for search');
    } catch (e: any) {
        console.error('Unified Search Error Details:', e);
        error(res, `Search failed: ${e.message}`, 500);
    }
};

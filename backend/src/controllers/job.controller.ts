import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Job from '../models/Job.model';
import Deal from '../models/Deal.model';
import { success, error } from '../utils/response';
import mongoose from 'mongoose';
import { NotificationService } from '../services/notification.service';

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.create({ ...req.body, contractorId: req.user._id });
        success(res, job, 'Job created');
    } catch (e: any) {
        error(res, e.message);
    }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
    try {
        const { q, lat, lng, distance = 25, skill, paymentType } = req.query;
        const filter: any = {};

        if (req.user.role === 'contractor') {
            filter.contractorId = req.user._id;
        } else {
            // Labours see open jobs
            filter.status = 'open';

            // Filter out jobs already applied by this labour
            filter['applications.labourId'] = { $ne: req.user._id };

            // Default skill-based matching if no specific skill search
            if (!q && !skill && req.user.role === 'labour') {
                if (req.user.isSkilled && req.user.skills && req.user.skills.length > 0) {
                    filter.workType = { $in: req.user.skills };
                } else {
                    filter.workType = 'helper';
                }
            }
        }

        // Apply Skill filter if provided
        if (skill) {
            filter.workType = skill;
        }

        // Apply Payment Type filter
        if (paymentType) {
            filter.paymentType = paymentType;
        }

        // Search Query Logic
        if (q) {
            const searchRegex = new RegExp(q as string, 'i');
            filter.$or = [
                { workType: searchRegex },
                { description: searchRegex },
                { 'location.address': searchRegex }
            ];
        }

        // Location-based filtering (Radius)
        if (lat && lng) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
                    },
                    $maxDistance: parseInt(distance as string) * 1000 // Convert km to meters
                }
            };
        }

        const jobs = await Job.find(filter)
            .populate('contractorId', 'name phone averageRating')
            .sort({ createdAt: -1 });

        success(res, jobs);
    } catch (e: any) {
        console.error('Get Jobs Error:', e);
        error(res, e.message);
    }
};

export const getJobDetails = async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findById(req.params.jobId)
            .populate('contractorId', 'name phone location')
            .populate('applications.labourId', 'name phone location skill experience');

        if (!job) return error(res, 'Job not found', 404);
        success(res, job);
    } catch (e: any) { error(res, e.message); }
};

export const applyToJob = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const labourId = req.user._id;

        if (req.user.role !== 'labour') {
            return error(res, 'Only labours can apply to jobs', 403);
        }

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);
        if (job.status !== 'open') return error(res, 'Job is no longer open for applications', 400);

        // Check if already applied
        const alreadyApplied = job.applications.some(app => app.labourId.toString() === labourId.toString());
        if (alreadyApplied) return error(res, 'You have already applied to this job', 400);

        job.applications.push({
            labourId: labourId as any,
            status: 'pending',
            appliedAt: new Date()
        });

        await job.save();

        // Send Notification to Contractor
        await NotificationService.createNotification({
            userId: job.contractorId.toString(),
            title: 'Nayi Application 🧑‍🔧',
            message: `${req.user.name || 'Ek labour'} ne aapke kaam "${job.workType}" ke liye apply kiya hai.`,
            type: 'application',
            relatedId: job._id.toString(),
            route: 'JobApplications'
        });

        success(res, job, 'Application submitted successfully');
    } catch (e: any) { error(res, e.message); }
};

export const handleApplication = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId, labourId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        if (req.user.role !== 'contractor') {
            return error(res, 'Only contractors can handle applications', 403);
        }

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);
        if (job.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        const application = job.applications.find(app => app.labourId.toString() === labourId);
        if (!application) return error(res, 'Application not found', 404);

        if (action === 'approve') {
            if (job.filledWorkers >= job.requiredWorkers) {
                return error(res, 'Job is already full', 400);
            }
            application.status = 'approved';
            job.filledWorkers += 1;

            if (job.filledWorkers === job.requiredWorkers) {
                job.status = 'in_progress';
            }

            // Create actual work Deal
            await Deal.create({
                jobId: job._id,
                contractorId: job.contractorId,
                labourId: labourId,
                status: 'active'
            });

        } else if (action === 'reject') {
            // If it was already approved, decrement filled count
            if (application.status === 'approved') {
                job.filledWorkers -= 1;
                job.status = 'open';
            }
            application.status = 'rejected';
        } else {
            return error(res, 'Invalid action', 400);
        }

        await job.save();

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: labourId,
            title: action === 'approve' ? 'Kaam Mil Gaya! ✔️' : 'Application Rejected ❌',
            message: action === 'approve'
                ? `Contractor ne aapka "${job.workType}" ke liye application approve kar diya hai. Ab Deals page par jayein.`
                : `Aapka "${job.workType}" ke liye application reject ho gaya hai. Doosre kaam dekhein.`,
            type: action === 'approve' ? 'approval' : 'rejection',
            relatedId: job._id.toString(),
            route: action === 'approve' ? 'Deals' : 'Main'
        });

        success(res, job, `Application ${action}d successfully`);
    } catch (e: any) { error(res, e.message); }
};

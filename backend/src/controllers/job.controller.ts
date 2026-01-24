import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Job from '../models/Job.model';
import Deal from '../models/Deal.model';
import { success, error } from '../utils/response';
import mongoose from 'mongoose';
import { NotificationService } from '../services/notification.service';

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        let {
            workType,
            description,
            requiredWorkers,
            paymentAmount,
            paymentType,
            location,
            duration,
            workSize,
            skills
        } = req.body;

        // Handle stringified fields if they come from FormData
        if (typeof location === 'string') location = JSON.parse(location);
        if (typeof workSize === 'string') workSize = JSON.parse(workSize);
        if (typeof skills === 'string') skills = JSON.parse(skills);

        // Map uploaded files to paths
        const images = (req.files as Express.Multer.File[])?.map(file => file.path.replace(/\\/g, '/'));

        const job = await Job.create({
            contractorId: req.user._id,
            workType,
            description,
            requiredWorkers,
            paymentAmount,
            paymentType,
            location,
            duration,
            images,
            workSize,
            skills
        });
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
        const { appliedSkill } = req.body;
        const labourId = req.user._id;

        if (req.user.role !== 'labour') {
            return error(res, 'Only labours can apply to jobs', 403);
        }

        if (!appliedSkill) {
            return error(res, 'Sahi skill select karein', 400);
        }

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);
        if (job.status !== 'open') return error(res, 'Job is no longer open for applications', 400);

        // Check if already applied for THIS skill
        const alreadyAppliedForSkill = job.applications.some(
            app => app.labourId.toString() === labourId.toString() && app.appliedSkill === appliedSkill
        );
        if (alreadyAppliedForSkill) {
            return error(res, `Aapne pehle hi "${appliedSkill}" ke liye apply kiya hua hai`, 400);
        }

        job.applications.push({
            labourId: labourId as any,
            appliedSkill,
            status: 'pending',
            appliedAt: new Date()
        });

        await job.save();

        // New: Create a Deal entry for this application so it shows in Deals tab
        await Deal.create({
            jobId: job._id,
            labourId: labourId,
            contractorId: job.contractorId,
            status: 'applied',
            appliedSkill,
            paymentStatus: 'pending'
        });

        // Send Notification to Contractor
        await NotificationService.createNotification({
            userId: job.contractorId.toString(),
            title: 'Nayi Application 🧑‍🔧',
            message: `${req.user.name || 'Ek labour'} ne "${appliedSkill}" ke taur par apply kiya hai.`,
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
        const { action, appliedSkill } = req.body; // 'approve' or 'reject'

        if (req.user.role !== 'contractor') {
            return error(res, 'Only contractors can handle applications', 403);
        }

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);
        if (job.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        const application = job.applications.find(
            app => app.labourId.toString() === labourId && app.appliedSkill === appliedSkill
        );
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

            // AUTO-REJECT other skills from the SAME labour for THIS job
            const otherApplications = job.applications.filter(
                app => app.labourId.toString() === labourId && app.appliedSkill !== appliedSkill && app.status === 'pending'
            );

            for (const otherApp of otherApplications) {
                otherApp.status = 'rejected';
                // Notify auto-rejection
                await NotificationService.createNotification({
                    userId: labourId,
                    title: 'Skill Application Update',
                    message: `Aapka "${appliedSkill}" approve ho gaya hai, isliye "${otherApp.appliedSkill}" ki application band kar di gayi hai.`,
                    type: 'rejection',
                    relatedId: job._id.toString(),
                    route: 'Deals'
                });
            }

            // Update existing Deal from 'applied' to 'active'
            const existingDeal = await Deal.findOneAndUpdate(
                { jobId: job._id, labourId: labourId, appliedSkill, status: 'applied' },
                { status: 'active' },
                { new: true }
            );

            if (!existingDeal) {
                // Fallback if deal wasn't created yet
                await Deal.create({
                    jobId: job._id,
                    contractorId: job.contractorId,
                    labourId: labourId,
                    appliedSkill,
                    status: 'active'
                });
            }

        } else if (action === 'reject') {
            application.status = 'rejected';

            // Update Deal status to rejected as well
            await Deal.findOneAndUpdate(
                { jobId: job._id, labourId: labourId, appliedSkill, status: 'applied' },
                { status: 'rejected' }
            );
        } else {
            return error(res, 'Invalid action', 400);
        }

        await job.save();

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: labourId,
            title: action === 'approve' ? 'Kaam Mil Gaya! ✔️' : 'Application Rejected ❌',
            message: action === 'approve'
                ? `Contractor ne aapka "${appliedSkill}" ke liye application approve kar diya hai. Ab Deals page par jayein.`
                : `Aapka "${appliedSkill}" ke liye application reject ho gaya hai. Doosre kaam dekhein.`,
            type: action === 'approve' ? 'approval' : 'rejection',
            relatedId: job._id.toString(),
            route: action === 'approve' ? 'Deals' : 'Main'
        });

        success(res, job, `Application ${action}d successfully`);
    } catch (e: any) { error(res, e.message); }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        let updates = req.body;

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);
        if (job.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        // Handle stringified fields
        if (typeof updates.location === 'string') updates.location = JSON.parse(updates.location);
        if (typeof updates.workSize === 'string') updates.workSize = JSON.parse(updates.workSize);
        if (typeof updates.skills === 'string') updates.skills = JSON.parse(updates.skills);

        // Handle images if any
        if (req.files && (req.files as any).length > 0) {
            const newImages = (req.files as Express.Multer.File[])?.map(file => file.path.replace(/\\/g, '/'));
            updates.images = [...(job.images || []), ...newImages];
        }

        const updatedJob = await Job.findByIdAndUpdate(jobId, updates, { new: true });
        success(res, updatedJob, 'Job updated successfully');
    } catch (e: any) {
        error(res, e.message);
    }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const { reason } = req.body;

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);
        if (job.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        // Notify all applicants before deleting
        const applicants = job.applications.map(app => app.labourId.toString());
        for (const labourId of applicants) {
            await NotificationService.createNotification({
                userId: labourId,
                title: 'Job Cancelled 🚫',
                message: `Contractor ne "${job.workType}" job delete kar di hai. Reason: ${reason || 'N/A'}`,
                type: 'info',
                relatedId: job._id.toString(),
                route: 'Main'
            });
        }

        // Also handle associated Deals (soft delete or status change might be better but let's delete if 'applied')
        await Deal.deleteMany({ jobId: job._id });

        await Job.findByIdAndDelete(jobId);
        success(res, null, 'Job deleted successfully');
    } catch (e: any) {
        error(res, e.message);
    }
};


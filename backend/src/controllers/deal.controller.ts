import { Response } from 'express';
import * as mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Review from '../models/Review.model';
import Deal from '../models/Deal.model';
import Job from '../models/Job.model';
import { success, error } from '../utils/response';
import { calculateLabourRank } from '../services/ranking.service';
import { NotificationService } from '../services/notification.service';

export const getDeals = async (req: AuthRequest, res: Response) => {
    try {
        const filter: any = {};
        if (req.user.role === 'contractor') {
            filter.contractorId = req.user._id;
        } else {
            filter.labourId = req.user._id;
        }

        const deals = await Deal.find(filter)
            .populate('jobId')
            .populate('labourId', 'name phone averageRating')
            .populate('contractorId', 'name phone averageRating')
            .sort({ updatedAt: -1 });

        const normalizedDeals = await Promise.all(deals.map(async (d: any) => {
            const dealObj = d.toObject();

            // Check if current user has already reviewed this deal
            const review = await Review.findOne({ dealId: d._id, reviewerId: (req as any).user._id });

            return {
                ...dealObj,
                id: d._id,
                isReviewed: !!review,
                workType: (d.jobId as any)?.workType || 'General Work',
                userName: (req as any).user.role === 'contractor' ? (d.labourId as any)?.name : (d.contractorId as any)?.name,
                location: (d.jobId as any)?.location || { area: 'Local', city: 'Nearby' }
            };
        }));

        success(res, normalizedDeals);
    } catch (e: any) { error(res, e.message); }
};

export const createDeal = async (req: AuthRequest, res: Response) => {
    try {
        const deal = await Deal.create({ ...req.body });
        success(res, deal, 'Deal created');
    } catch (e: any) { error(res, e.message); }
};

export const applyForJob = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.body;
        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);

        const existing = await Deal.findOne({ jobId, labourId: req.user._id });
        if (existing) return error(res, 'Already applied to this job', 400);

        const deal = await Deal.create({
            jobId,
            labourId: req.user._id,
            contractorId: job.contractorId,
            status: 'applied',
            paymentStatus: 'pending',
            labourFinishRequested: false
        });

        success(res, deal, 'Applied successfully');
    } catch (e: any) { error(res, e.message); }
};

export const requestCompletion = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const deal = await Deal.findById(dealId);

        if (!deal) return error(res, 'Deal not found', 404);
        if (deal.labourId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        if (deal.status !== 'active') {
            return error(res, 'Only active jobs can be marked as finished', 400);
        }

        deal.labourFinishRequested = true;
        deal.status = 'completion_requested';
        deal.completionStatus = 'requested';
        await deal.save();

        // Send Notification to Contractor
        await NotificationService.createNotification({
            userId: deal.contractorId.toString(),
            title: 'Kaam Khatam? 🧑‍🔧',
            message: `${req.user.name || 'Labour'} ne kaam khatam hone ki request bheji hai. Verify karein.`,
            type: 'completion',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        success(res, deal, 'Work completion requested successfully');
    } catch (e: any) { error(res, e.message); }
};

export const approveCompletion = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const deal = await Deal.findById(dealId);

        if (!deal) return error(res, 'Deal not found', 404);
        if (deal.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        if (deal.status !== 'completion_requested') {
            return error(res, 'No completion request found for this deal', 400);
        }

        deal.status = 'finished';
        deal.completionStatus = 'approved';
        await deal.save();
        console.log(`[Deal] Marked deal ${dealId} as finished (Work Approved)`);

        // Recalculate Labour Rank on Completion
        await calculateLabourRank((deal.labourId as any));

        // Update Job status
        const jobDeals = await Deal.find({
            jobId: deal.jobId,
            status: { $in: ['active', 'completion_requested', 'finished', 'completed'] }
        });

        const allFinished = jobDeals.length > 0 && jobDeals.every(d => ['finished', 'completed'].includes(d.status));

        if (allFinished) {
            console.log(`[Job] Marking job ${deal.jobId} as completed because all workers finished`);
            await Job.findByIdAndUpdate(deal.jobId, { status: 'completed' });
        }

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: deal.labourId.toString(),
            title: 'Job Completed ⭐',
            message: `Contractor ne kaam approve kar diya hai. Paisa received? Rating dena na bhoolein.`,
            type: 'completion',
            relatedId: deal._id.toString(),
            route: 'Rating'
        });

        // Send Notification to Contractor (Reminder to rate)
        await NotificationService.createNotification({
            userId: deal.contractorId.toString(),
            title: 'Kaam Khatam ⭐',
            message: `Aapne kaam approve kar diya hai. Labour ko rate karein taaki Bharat Chowk aur behtar bane.`,
            type: 'rating',
            relatedId: deal._id.toString(),
            route: 'Rating'
        });

        success(res, deal, 'Job completed and closed successfully');
    } catch (e: any) {
        console.error('Approve Completion Error:', e);
        error(res, e.message);
    }
};

export const rejectCompletion = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const { reasonCodes, note } = req.body;

        if (!reasonCodes || !Array.isArray(reasonCodes) || reasonCodes.length === 0) {
            return error(res, 'At least one rejection reason is required', 400);
        }

        const deal = await Deal.findById(dealId);
        if (!deal) return error(res, 'Deal not found', 404);
        if (deal.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        deal.status = 'active'; // Back to active so labour can fix and re-finish
        deal.completionStatus = 'rejected';

        if (!deal.rejectionHistory) deal.rejectionHistory = [];
        deal.rejectionHistory.push({
            reasonCodes,
            note: note || null,
            rejectedAt: new Date()
        });

        await deal.save();

        // Send Notification to Labour
        await NotificationService.createNotification({
            userId: deal.labourId.toString(),
            title: 'Kaam Rejected 🔴',
            message: `Contractor ne completion request reject ki hai: ${reasonCodes.join(', ')}`,
            type: 'completion',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        success(res, deal, 'Completion rejected with reasons');
    } catch (e: any) { error(res, e.message); }
};

export const approveApplication = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { dealId, selectedSkill } = req.body;
        const deal = await Deal.findById(dealId).session(session);

        if (!deal) {
            await session.abortTransaction();
            return error(res, 'Deal not found', 404);
        }

        if (deal.contractorId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            return error(res, 'Unauthorized', 401);
        }

        const job = await Job.findById(deal.jobId).session(session);
        if (!job) {
            await session.abortTransaction();
            return error(res, 'Job not found', 404);
        }

        // 1. Validate skill slot
        const skillReq = job.skills.find(s => s.skillType === selectedSkill);
        if (!skillReq) {
            await session.abortTransaction();
            return error(res, `Skill ${selectedSkill} not required for this job`, 400);
        }

        if (skillReq.filledCount >= skillReq.requiredCount) {
            await session.abortTransaction();
            return error(res, `Slots for ${selectedSkill} are already full`, 400);
        }

        // 2. Approve this deal
        deal.status = 'active';
        deal.appliedSkill = selectedSkill; // Set the finalized skill
        await deal.save({ session });

        // 3. Update Job stats
        skillReq.filledCount += 1;
        job.filledWorkers += 1;

        // Update application status within Job model
        const app = job.applications.find(a =>
            a.labourId.toString() === deal.labourId.toString() &&
            a.status === 'pending'
        );
        if (app) app.status = 'approved';

        if (job.filledWorkers >= job.requiredWorkers) {
            job.status = 'in_progress';
        }
        await job.save({ session });

        // 4. Auto-reject other applications by SAME labour for SAME job
        const otherDealsByLabour = await Deal.find({
            jobId: deal.jobId,
            labourId: deal.labourId,
            _id: { $ne: deal._id },
            status: 'applied'
        }).session(session);

        for (const otherDeal of otherDealsByLabour) {
            otherDeal.status = 'rejected';
            await otherDeal.save({ session });

            // Notify labour about auto-rejection
            await NotificationService.createNotification({
                userId: deal.labourId.toString(),
                title: 'Application Update',
                message: `Aapka ${otherDeal.appliedSkill || 'worker'} application reject kar diya gaya hai kyunki aapko isi kaam mein doosra role mil gaya hai.`,
                type: 'rejection',
                relatedId: otherDeal._id.toString(),
                route: 'Deals'
            });
        }

        // 5. If skill slot filled, auto-reject REMAINING applications for THIS skill
        if (skillReq.filledCount >= skillReq.requiredCount) {
            const remainingDeals = await Deal.find({
                jobId: deal.jobId,
                appliedSkill: selectedSkill,
                status: 'applied'
            }).session(session);

            for (const remDeal of remainingDeals) {
                remDeal.status = 'rejected';
                await remDeal.save({ session });

                await NotificationService.createNotification({
                    userId: remDeal.labourId.toString(),
                    title: 'Slot Full',
                    message: `Aapka ${selectedSkill} application reject ho gaya hai kyunki saare slots bhar gaye hain.`,
                    type: 'rejection',
                    relatedId: remDeal._id.toString(),
                    route: 'Deals'
                });
            }
        }

        // 6. Notify Approved Labour
        await NotificationService.createNotification({
            userId: deal.labourId.toString(),
            title: 'Congratulations! 🎉',
            message: `Aapka application approve ho gaya hai for ${selectedSkill}. Kaam shuru karein!`,
            type: 'approval',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        await session.commitTransaction();
        success(res, deal, 'Application approved and slots updated');
    } catch (e: any) {
        await session.abortTransaction();
        console.error('Approve Application Error:', e);
        error(res, e.message);
    } finally {
        session.endSession();
    }
};

export const updateDealStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId, status } = req.body;
        const deal = await Deal.findById(dealId);

        if (!deal) return error(res, 'Deal not found', 404);
        if (deal.contractorId.toString() !== req.user._id.toString()) {
            return error(res, 'Unauthorized', 401);
        }

        if (!['active', 'rejected'].includes(status)) {
            return error(res, 'Invalid status update for application', 400);
        }

        deal.status = status;
        await deal.save();

        // Keep Job model in sync
        const job = await Job.findById(deal.jobId);
        if (job) {
            const application = job.applications.find(
                app => app.labourId.toString() === deal.labourId.toString() && app.appliedSkill === deal.appliedSkill
            );
            if (application) {
                if (status === 'active') {
                    application.status = 'approved';
                    job.filledWorkers += 1;
                    if (job.filledWorkers === job.requiredWorkers) {
                        job.status = 'in_progress';
                    }
                } else if (status === 'rejected') {
                    application.status = 'rejected';
                }
                await job.save();
            }
        }

        if (status === 'rejected') {
            await calculateLabourRank((deal.labourId as any));
        }

        success(res, deal, `Application ${status}`);
    } catch (e: any) { error(res, e.message); }
};

export const getDeal = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const deal = await Deal.findById(dealId)
            .populate('jobId')
            .populate('labourId', 'name phone location skill')
            .populate('contractorId', 'name phone location');

        if (!deal) return error(res, 'Deal not found', 404);
        success(res, deal);
    } catch (e: any) { error(res, e.message); }
};

export const cancelDeal = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { dealId } = req.params;
        const { reason } = req.body;
        const deal = await Deal.findById(dealId).session(session);

        if (!deal) {
            await session.abortTransaction();
            return error(res, 'Deal not found', 404);
        }

        const isContractor = deal.contractorId.toString() === req.user._id.toString();
        const isLabour = deal.labourId.toString() === req.user._id.toString();

        if (!isContractor && !isLabour) {
            await session.abortTransaction();
            return error(res, 'Unauthorized', 401);
        }

        if (['finished', 'completed', 'cancelled', 'rejected'].includes(deal.status)) {
            await session.abortTransaction();
            return error(res, `Cannot cancel deal with status ${deal.status}`, 400);
        }

        const oldStatus = deal.status;
        deal.status = 'cancelled';
        await deal.save({ session });

        // If the deal was active or completion_requested, we need to free up the slot in the Job
        if (oldStatus === 'active' || oldStatus === 'completion_requested') {
            const job = await Job.findById(deal.jobId).session(session);
            if (job) {
                // Update skill slot if appliedSkill exists
                if (deal.appliedSkill) {
                    const skillReq = job.skills.find(s => s.skillType === deal.appliedSkill);
                    if (skillReq && skillReq.filledCount > 0) {
                        skillReq.filledCount -= 1;
                    }
                }

                // Update total filled workers
                if (job.filledWorkers > 0) {
                    job.filledWorkers -= 1;
                }

                // If job was in_progress and now has empty slots, move back to open
                if (job.status === 'in_progress' && job.filledWorkers < job.requiredWorkers) {
                    job.status = 'open';
                }

                // Also update the application status in the job model
                const application = job.applications.find(
                    app => app.labourId.toString() === deal.labourId.toString() && app.status === 'approved'
                );
                if (application) {
                    application.status = 'pending'; // Reset or should it be 'rejected'? Let's say cancelled removes it?
                    // Actually, let's just mark it as rejected in the applications list or remove it
                    application.status = 'rejected';
                }

                await job.save({ session });
            }
        }

        // Send Notifications
        const otherUserId = isContractor ? deal.labourId : deal.contractorId;
        const userType = isContractor ? 'Contractor' : 'Labour';

        await NotificationService.createNotification({
            userId: otherUserId.toString(),
            title: 'Job Cancelled ❌',
            message: `${userType} ne job cancel kar di hai. Reason: ${reason || 'Not specified'}`,
            type: 'cancellation',
            relatedId: deal._id.toString(),
            route: 'Deals'
        });

        // Penalize rank for cancellation if it was already active
        if (oldStatus === 'active' || oldStatus === 'completion_requested') {
            await calculateLabourRank(deal.labourId as any);
        }

        await session.commitTransaction();
        success(res, deal, 'Deal cancelled successfully');
    } catch (e: any) {
        await session.abortTransaction();
        console.error('Cancel Deal Error:', e);
        error(res, e.message);
    } finally {
        session.endSession();
    }
};

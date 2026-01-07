import { Response } from 'express';
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

        deal.status = 'completed';
        await deal.save();
        console.log(`[Deal] Marked deal ${dealId} as completed`);

        // Recalculate Labour Rank on Completion
        await calculateLabourRank((deal.labourId as any));

        // Update Job status: If all active deals for this job are now completed
        // We find all deals for this job EXCEPT the ones that were rejected or just applied
        const jobDeals = await Deal.find({
            jobId: deal.jobId,
            status: { $in: ['active', 'completion_requested', 'completed'] }
        });

        const allFinished = jobDeals.length > 0 && jobDeals.every(d => d.status === 'completed');

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

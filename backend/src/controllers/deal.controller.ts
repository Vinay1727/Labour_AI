import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Deal from '../models/Deal.model';
import { success, error } from '../utils/response';

import Job from '../models/Job.model';

export const createDeal = async (req: AuthRequest, res: Response) => {
    try {
        // Direct creation (maybe by contractor)
        const deal = await Deal.create({ ...req.body });
        success(res, deal, 'Deal created');
    } catch (e: any) { error(res, e.message); }
};

export const applyForJob = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.body;
        console.log('Apply Job Request:', { jobId, userId: req.user._id });

        const job = await Job.findById(jobId);
        if (!job) return error(res, 'Job not found', 404);

        // Check if already applied
        const existing = await Deal.findOne({ jobId, labourId: req.user._id });
        if (existing) return error(res, 'Already applied to this job', 400);

        const deal = await Deal.create({
            jobId,
            labourId: req.user._id,
            contractorId: job.contractorId,
            status: 'applied',
            paymentStatus: 'pending'
        });

        console.log('Deal/Application Created:', deal._id);
        success(res, deal, 'Applied successfully');
    } catch (e: any) {
        console.error('Apply Job Error:', e);
        error(res, e.message);
    }
};

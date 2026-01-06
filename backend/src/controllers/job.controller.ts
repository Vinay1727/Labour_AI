import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Job from '../models/Job.model';
import { success, error } from '../utils/response';

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Create Job Request:', req.body);
        console.log('User:', req.user._id);

        const job = await Job.create({ ...req.body, contractorId: req.user._id });
        console.log('Job Created DB ID:', job._id);

        success(res, job, 'Job created');
    } catch (e: any) {
        console.error('Create Job Error:', e.message);
        error(res, e.message);
    }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
    try {
        const jobs = await Job.find({ status: 'open' });
        success(res, jobs);
    } catch (e: any) { error(res, e.message); }
};

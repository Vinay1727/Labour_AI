import { Request, Response } from 'express';
import User from '../models/User.model';
import Job from '../models/Job.model';
import Deal from '../models/Deal.model';
import { generateToken } from '../utils/jwt';
import { success, error } from '../utils/response';

// 1. Admin Login
export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Hardcoded Admin Credentials (CHANGE THESE FOR PRODUCTION)
        if (email === "admin@platform.com" && password === "admin123") {
            const token = generateToken("admin_id", "admin");
            return success(res, {
                token,
                user: { name: "Master Admin", email, role: "admin" }
            }, "Admin login successful");
        }

        return error(res, "Invalid Admin Credentials", 401);
    } catch (e: any) {
        return error(res, e.message);
    }
};

// 2. Dashboard Stats (Overview)
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Count documents
        const totalUsers = await User.countDocuments({});
        const labourers = await User.countDocuments({ role: 'labour' });
        const contractors = await User.countDocuments({ role: 'contractor' });

        const activeJobs = await Job.countDocuments({ status: { $in: ['open', 'in_progress'] } });
        const completedJobs = await Job.countDocuments({ status: 'completed' });

        const activeDeals = await Deal.countDocuments({ status: { $in: ['active', 'applied'] } });

        success(res, {
            totalUsers,
            labourers: labourers,
            contractors,
            activeJobs,
            completedJobs,
            activeDeals,
            totalRatings: 152 // Mock or calc from DB
        });
    } catch (e: any) {
        error(res, e.message);
    }
};

// 3. Get All Labours
export const getLabours = async (req: Request, res: Response) => {
    try {
        const labours = await User.find({ role: 'labour' })
            .select('name phone skills isVerified averageRating trustScore rank createdAt')
            .sort({ createdAt: -1 });

        success(res, labours);
    } catch (e: any) {
        error(res, e.message);
    }
};

// 4. Get All Contractors
export const getContractors = async (req: Request, res: Response) => {
    try {
        const contractors = await User.find({ role: 'contractor' })
            .select('name phone isVerified averageRating createdAt')
            .sort({ createdAt: -1 });

        success(res, contractors);
    } catch (e: any) {
        error(res, e.message);
    }
};

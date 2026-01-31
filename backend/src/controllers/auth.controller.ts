import { Request, Response } from 'express';
import { success, error } from '../utils/response';
import User from '../models/User.model';
import { generateToken } from '../utils/jwt';
import otpService from '../services/otp.service';

export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        console.log('OTP Request for:', phone);

        let user = await User.findOne({ phone });

        // If user doesn't exist, we might need to create a temporary record or just store OTP
        // Ideally we should have an OTP collection, but for now let's create a User stub if needed
        // OR better: Only send OTP if we plan to register? No, we need OTP for reg too.
        // Let's create the user if not exists with "isVerified: false"
        if (!user) {
            console.log('User not found, creating temporary for OTP...');
            // We can't create fully without name/role, but maybe we can just upsert or findOneAndUpdate if we allow partials?
            // Actually, verifyOtp handles creation.
            // We need a place to store OTP for a non-existent user.
            // Solution: Use a separate OTP model or just create the user with default "Guest" name.
            // Let's create the user here to store the OTP.
            user = await User.create({
                phone,
                name: 'Guest', // Temporary
                role: 'labour', // Default, changed later
                isVerified: false
            });
        }

        let sentOtp: string | undefined;

        // Real OTP send using RapidAPI
        if (process.env.OTP_BYPASS_ENABLED !== 'true') {
            const apiRes = await otpService.sendOTP(phone);
            if (apiRes.success && apiRes.otp) {
                sentOtp = apiRes.otp;
                // Save OTP to DB
                user.phoneUpdateOTP = sentOtp;
                user.phoneUpdateOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
                await user.save();
            }
        }

        // Dev Bypass Logic
        if (process.env.OTP_BYPASS_ENABLED === 'true') {
            sentOtp = '1234';
            user.phoneUpdateOTP = sentOtp;
            user.phoneUpdateOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
        }

        success(res, {
            exists: !!user,
            otpSent: true,
            // In production, don't send OTP in response
            otp: process.env.OTP_BYPASS_ENABLED === 'true' ? '1234' : undefined
        }, 'OTP sent successfully');

    } catch (e: any) {
        console.error('OTP Request Error:', e);
        error(res, e.message || 'Failed to send OTP');
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp, name } = req.body;
        console.log('Verifying OTP for:', phone, 'OTP:', otp);

        const user = await User.findOne({ phone });
        if (!user) {
            return error(res, 'User not found (OTP not requested?)', 400);
        }

        const bypassEnabled = process.env.OTP_BYPASS_ENABLED === 'true';
        const testOtp = process.env.TEST_OTP || '1234';

        if (bypassEnabled) {
            if (otp !== testOtp) return error(res, 'Invalid OTP (Test Mode)', 400);
        } else {
            // Check DB OTP
            if (!user.phoneUpdateOTP || user.phoneUpdateOTP !== otp) {
                return error(res, 'Invalid OTP', 400);
            }
            // Check Expiry
            if (user.phoneUpdateOTPExpire && user.phoneUpdateOTPExpire < new Date()) {
                return error(res, 'OTP Expired', 400);
            }
        }

        // Clear OTP
        user.phoneUpdateOTP = undefined;
        user.phoneUpdateOTPExpire = undefined;
        // Update Name if provided (Register flow)
        if (name && user.name === 'Guest') {
            user.name = name;
        }
        await user.save();


        const role = user.role || 'labour'; // Default for token generation, though maybe 'pending' is safer? 
        // Let's use 'labour' as a safe fallback for token so middlewares don't crash, 
        // but frontend will redirect to RoleSelection if user.role is falsy.
        const token = generateToken(user._id.toString(), role as any);

        success(res, {
            token,
            user,
            isNewUser: !user.role // Flag to frontend to show RoleSelection
        }, 'Login successful');

    } catch (e: any) {
        console.error('Verify OTP Error:', e);
        error(res, e.message);
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        console.log('Register Request Body:', req.body);
        const { name, phone, role } = req.body;
        // Logic to create user
        const userExists = await User.findOne({ phone });
        if (userExists) {
            console.log('User already exists:', phone);
            return error(res, 'User already exists', 400);
        }

        const user = await User.create({ name, phone, role });
        console.log('User created:', user._id);
        const token = generateToken(user._id.toString(), user.role);

        success(res, { user, token }, 'User registered');
    } catch (e: any) {
        console.error('Register Error:', e.message);
        error(res, e.message);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body; // In real app, verify OTP
        const user = await User.findOne({ phone });

        if (!user) {
            return error(res, 'User not found', 404);
        }

        const token = generateToken(user._id.toString(), user.role);
        success(res, { user, token }, 'User logged in');
    } catch (e: any) {
        error(res, e.message);
    }
};

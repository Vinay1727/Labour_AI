import { Request, Response } from 'express';
import { success, error } from '../utils/response';
import User from '../models/User.model';
import { generateToken } from '../utils/jwt';

export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;
        console.log('OTP Request for:', phone);

        const user = await User.findOne({ phone });
        // Simulating OTP send
        const otp = '1234';

        success(res, {
            exists: !!user,
            otpSent: true,
            // Only for dev debugging
            otp
        }, 'OTP sent successfully');

    } catch (e: any) {
        console.error('OTP Request Error:', e);
        error(res, e.message);
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp, name } = req.body;
        console.log('Verifying OTP for:', phone, 'OTP:', otp);

        if (otp !== '1234') { // Mock OTP
            return error(res, 'Invalid OTP', 400);
        }

        let user = await User.findOne({ phone });

        if (!user) {
            // Create User
            console.log('Creating new user for phone:', phone);
            user = await User.create({
                name: name || 'User',
                phone,
                // Role is optional now
            });
        }

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

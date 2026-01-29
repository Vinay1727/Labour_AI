import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: (err as any).path,
                message: err.msg
            }))
        });
    }
    next();
};

export const authValidators = {
    requestOtp: [
        body('phone')
            .isMobilePhone('any')
            .withMessage('Please provide a valid phone number'),
        validateRequest
    ],
    verifyOtp: [
        body('phone')
            .isMobilePhone('any')
            .withMessage('Please provide a valid phone number'),
        body('otp')
            .isLength({ min: 4, max: 6 })
            .withMessage('OTP must be 4-6 digits'),
        validateRequest
    ],
    register: [
        body('name').notEmpty().withMessage('Name is required'),
        body('phone').isMobilePhone('any').withMessage('Valid phone is required'),
        body('role').isIn(['contractor', 'labour']).withMessage('Invalid role'),
        validateRequest
    ]
};

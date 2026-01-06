import { Response } from 'express';

export const success = (res: Response, data: any, message: string = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
};

export const error = (res: Response, message: string = 'Server Error', statusCode: number = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

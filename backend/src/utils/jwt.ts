import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, JWT_SECRET, {
        expiresIn: '7d', // Reduced from 30d for better security
    });

};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};

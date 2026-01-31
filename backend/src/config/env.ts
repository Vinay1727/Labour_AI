import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/labour-chowk';
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const RAPID_API_KEY = process.env.RAPID_API_KEY || '';
export const RAPID_API_HOST = process.env.RAPID_API_HOST || 'gurubrahma-smsly-sms-to-india-v1.p.rapidapi.com';

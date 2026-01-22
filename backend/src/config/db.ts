import mongoose from 'mongoose';
import { MONGO_URI } from './env';

export const connectDB = async () => {
    try {
        console.log(`Attempting to connect to MongoDB at: ${MONGO_URI.split('@')[1] || 'localhost/local_db'}...`);
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

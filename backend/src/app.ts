import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import jobRoutes from './routes/job.routes';
import dealRoutes from './routes/deal.routes';
import attendanceRoutes from './routes/attendance.routes';
import reviewRoutes from './routes/review.routes';
import searchRoutes from './routes/search.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
// Database connection moved to server.ts

// Routes
app.get('/', (req, res) => {
    res.send('Labour Chowk API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all for debugging 404s
app.use('*', (req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

export default app;

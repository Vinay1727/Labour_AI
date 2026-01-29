import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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
import adminRoutes from './routes/admin.routes';

const app = express();

// 1. GLOBAL MIDDLEWARES

// Rate Limiting - General API
const limiter = rateLimit({
    max: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// AUTH Rate Limiting - Very strict for login/OTP
const authLimiter = rateLimit({
    max: 5, // 5 attempts
    windowMs: 60 * 60 * 1000, // per hour
    message: 'Too many login attempts. Please try again after an hour.'
});
app.use('/api/auth/request-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// Secure HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https://*"],
            connectSrc: ["'self'", "https://*", "http://*"],
        },
    },
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// CORS - Restrict to specific origins in production
const allowedOrigins = [
    'http://localhost:3000', // Web testing
    'http://localhost:19006', // Expo Web
    // Add your production domain here
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb for security

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Compression for faster responses
app.use(compression());




// Static files
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
app.use('/api/admin', adminRoutes);

// Catch-all for debugging 404s
app.use('*', (req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('SERVER ERROR:', err);

    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    res.status(statusCode).json({
        success: false,
        status: status,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});


export default app;

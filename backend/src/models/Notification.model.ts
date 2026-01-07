import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'approval' | 'rejection' | 'application' | 'attendance' | 'completion' | 'message' | 'rating' | 'update';
    relatedId?: mongoose.Types.ObjectId; // jobId / dealId / chatId
    route: string; // screen name to open
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['approval', 'rejection', 'application', 'attendance', 'completion', 'message', 'rating', 'update'],
        required: true
    },
    relatedId: { type: Schema.Types.ObjectId },
    route: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

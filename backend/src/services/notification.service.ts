import Notification, { NotificationType } from '../models/Notification.model';
import mongoose from 'mongoose';

export class NotificationService {
    static async createNotification(data: {
        userId: string | mongoose.Types.ObjectId;
        title: string;
        message: string;
        type: NotificationType;
        relatedId?: string | mongoose.Types.ObjectId;
        route: string;
    }) {
        try {
            const notification = new Notification({
                ...data,
                isRead: false,
                createdAt: new Date()
            });
            await notification.save();

            // Note: In the future, trigger Push Notification here via Firebase/OneSignal
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    static async getNotificationsForUser(userId: string) {
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
    }

    static async markAsRead(notificationId: string) {
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }

    static async markAllAsRead(userId: string) {
        return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    }

    static async getUnreadCount(userId: string) {
        return await Notification.countDocuments({ userId, isRead: false });
    }
}

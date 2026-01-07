import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await NotificationService.getNotificationsForUser(userId);
        const unreadCount = await NotificationService.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await NotificationService.markAsRead(id);
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAllRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await NotificationService.markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import { Response } from 'express';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import Message from '../models/Message.model';
import Deal from '../models/Deal.model';
import { NotificationService } from '../services/notification.service';

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId, message, receiverId } = req.body;
        const senderId = req.user._id;

        // 1. Validate Deal existence and status
        const deal = await Deal.findById(dealId);
        if (!deal) {
            return error(res, 'Deal not found', 404);
        }

        // 2. STRICT RULE: Check if deal is approved
        // Approval means status is NOT 'applied' and NOT 'rejected'
        const allowedStatuses = ['assigned', 'active', 'completion_requested', 'completed'];
        if (!allowedStatuses.includes(deal.status)) {
            return error(res, 'Messaging is only allowed for approved/active deals', 403);
        }

        // 3. Prevent messaging if user is not part of the deal
        const isParticipant =
            deal.contractorId.toString() === senderId.toString() ||
            deal.labourId.toString() === senderId.toString();

        if (!isParticipant) {
            return error(res, 'You are not a participant in this deal', 403);
        }

        // 4. Save Message
        const newMessage = await Message.create({
            dealId,
            senderId,
            receiverId,
            message
        });

        // 5. Send Notification to Receiver
        await NotificationService.createNotification({
            userId: receiverId,
            title: `Naya Message 💬 - ${req.user.name || 'User'}`,
            message: message.length > 50 ? message.substring(0, 47) + '...' : message,
            type: 'message',
            relatedId: dealId,
            route: 'Chat'
        });

        success(res, newMessage, 'Message sent successfully');
    } catch (e: any) {
        error(res, e.message);
    }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { dealId } = req.params;
        const userId = req.user._id;

        const deal = await Deal.findById(dealId);
        if (!deal) return error(res, 'Deal not found', 404);

        // Security check
        const isParticipant =
            deal.contractorId.toString() === userId.toString() ||
            deal.labourId.toString() === userId.toString();

        if (!isParticipant) return error(res, 'Access denied', 403);

        const messages = await Message.find({ dealId })
            .sort({ createdAt: 1 })
            .limit(100);

        success(res, messages);
    } catch (e: any) {
        error(res, e.message);
    }
};

export const getActiveChats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        // Get all deals where user is a participant and status is approved
        const approvedDeals = await Deal.find({
            $or: [{ contractorId: userId }, { labourId: userId }],
            status: { $in: ['assigned', 'active', 'completion_requested', 'completed'] }
        })
            .populate('contractorId', 'name phone')
            .populate('labourId', 'name phone')
            .populate('jobId', 'workType');

        // For each deal, get the last message if exists
        const chats = await Promise.all(approvedDeals.map(async (deal: any) => {
            const lastMsg = await Message.findOne({ dealId: deal._id })
                .sort({ createdAt: -1 });

            return {
                dealId: deal._id,
                jobType: deal.jobId?.workType || 'Job',
                otherUser: deal.contractorId._id.toString() === userId.toString() ? deal.labourId : deal.contractorId,
                lastMessage: lastMsg?.message || 'No messages yet',
                lastMessageTime: lastMsg?.createdAt || deal.updatedAt,
                status: deal.status
            };
        }));

        success(res, chats.sort((a: any, b: any) =>
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        ));
    } catch (e: any) {
        error(res, e.message);
    }
};

import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    dealId: mongoose.Schema.Types.ObjectId;
    senderId: mongoose.Schema.Types.ObjectId;
    receiverId: mongoose.Schema.Types.ObjectId;
    message: string;
    messageType: 'text' | 'image' | 'voice' | 'attendance_proof';
    imageUrl?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    attendanceId?: mongoose.Schema.Types.ObjectId;
    status?: string; // e.g., 'pending', 'approved', 'rejected'
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'image', 'voice', 'attendance_proof'], default: 'text' },
    imageUrl: { type: String },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
    status: { type: String },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Index for fast chat history lookup
MessageSchema.index({ dealId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

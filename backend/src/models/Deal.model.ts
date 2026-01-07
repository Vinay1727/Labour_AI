import mongoose, { Document, Schema } from 'mongoose';

export interface IDeal extends Document {
    jobId: mongoose.Schema.Types.ObjectId;
    contractorId: mongoose.Schema.Types.ObjectId;
    labourId: mongoose.Schema.Types.ObjectId;
    status: 'applied' | 'assigned' | 'active' | 'completion_requested' | 'completed' | 'rejected';
    paymentStatus: 'pending' | 'paid';
    labourFinishRequested: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DealSchema: Schema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    labourId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['applied', 'assigned', 'active', 'completion_requested', 'completed', 'rejected'],
        default: 'applied'
    },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    labourFinishRequested: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IDeal>('Deal', DealSchema);

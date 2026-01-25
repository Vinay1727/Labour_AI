import mongoose, { Document, Schema } from 'mongoose';

export interface IDeal extends Document {
    jobId: mongoose.Schema.Types.ObjectId;
    contractorId: mongoose.Schema.Types.ObjectId;
    labourId: mongoose.Schema.Types.ObjectId;
    status: 'applied' | 'assigned' | 'active' | 'completion_requested' | 'finished' | 'completed' | 'rejected' | 'cancelled';
    paymentStatus: 'pending' | 'paid';
    labourFinishRequested: boolean;
    appliedSkill?: string;
    hasPartner?: boolean;
    partnerCount?: number;
    labourRated?: boolean;
    contractorRated?: boolean;
    completionStatus?: 'requested' | 'approved' | 'rejected';
    rejectionHistory?: Array<{
        reasonCodes: string[];
        note?: string | null;
        rejectedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const DealSchema: Schema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    labourId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['applied', 'assigned', 'active', 'completion_requested', 'finished', 'completed', 'rejected', 'cancelled'],
        default: 'applied'
    },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    labourFinishRequested: { type: Boolean, default: false },
    appliedSkill: { type: String },
    hasPartner: { type: Boolean, default: false },
    partnerCount: { type: Number, default: 0 },
    labourRated: { type: Boolean, default: false },
    contractorRated: { type: Boolean, default: false },
    completionStatus: {
        type: String,
        enum: ['requested', 'approved', 'rejected'],
    },
    rejectionHistory: [{
        reasonCodes: [{ type: String }],
        note: { type: String, default: null },
        rejectedAt: { type: Date }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

DealSchema.virtual('id').get(function (this: any) {
    return this._id.toHexString();
});

export default mongoose.model<IDeal>('Deal', DealSchema);

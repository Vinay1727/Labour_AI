import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    contractorId: mongoose.Schema.Types.ObjectId;
    workType: string;
    description?: string;
    requiredWorkers: number;
    paymentAmount: number;
    paymentType: 'per_day' | 'fixed';
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    status: 'open' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema({
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workType: { type: String, required: true },
    description: { type: String },
    requiredWorkers: { type: Number, required: true },
    paymentAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['per_day', 'fixed'], default: 'per_day' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        address: { type: String }
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, {
    timestamps: true
});

JobSchema.index({ location: '2dsphere' });

export default mongoose.model<IJob>('Job', JobSchema);

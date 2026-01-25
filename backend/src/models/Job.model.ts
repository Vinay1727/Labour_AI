import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication {
    labourId: mongoose.Schema.Types.ObjectId;
    appliedSkill: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: Date;
    hasPartner?: boolean;
    partnerCount?: number;
}

export interface ISkillRequirement {
    skillType: string;
    requiredCount: number;
    filledCount: number;
    payment: {
        amount: number;
        type: 'per_day' | 'fixed';
    };
}

export interface IJob extends Document {
    contractorId: mongoose.Schema.Types.ObjectId;
    workType: string;
    description?: string;
    requiredWorkers: number;
    filledWorkers: number;
    paymentAmount: number;
    paymentType: 'per_day' | 'fixed';
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    duration?: string;
    images?: string[];
    workSize?: {
        length: number;
        height: number;
    };
    status: 'open' | 'in_progress' | 'completed' | 'closed';
    skills: ISkillRequirement[];
    applications: IApplication[];
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema({
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workType: { type: String, required: true },
    description: { type: String },
    requiredWorkers: { type: Number, required: true },
    filledWorkers: { type: Number, default: 0 },
    paymentAmount: { type: Number, required: true },
    paymentType: { type: String, enum: ['per_day', 'fixed'], default: 'per_day' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        address: { type: String }
    },
    duration: { type: String },
    images: { type: [String], default: [] },
    workSize: {
        length: { type: Number },
        height: { type: Number }
    },
    status: { type: String, enum: ['open', 'in_progress', 'completed', 'closed'], default: 'open' },
    skills: [{
        skillType: { type: String, required: true },
        requiredCount: { type: Number, required: true },
        filledCount: { type: Number, default: 0 },
        payment: {
            amount: { type: Number },
            type: { type: String, enum: ['per_day', 'fixed'] }
        }
    }],
    applications: [{
        labourId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        appliedSkill: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        appliedAt: { type: Date, default: Date.now },
        hasPartner: { type: Boolean, default: false },
        partnerCount: { type: Number, default: 0 }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

JobSchema.virtual('id').get(function (this: any) {
    return this._id.toHexString();
});

JobSchema.index({ location: '2dsphere' });

export default mongoose.model<IJob>('Job', JobSchema);

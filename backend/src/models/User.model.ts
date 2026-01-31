import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    phone: string;
    role: 'contractor' | 'labour' | 'admin';
    location?: {
        type: string;
        coordinates: number[]; // [long, lat]
        address?: string;
    };
    skills?: string[]; // For labour
    isSkilled?: boolean; // For labour
    isVerified: boolean;
    averageRating: number;
    reviewCount: number;
    rank: 'Top Labour' | 'Trusted' | 'Reliable' | 'Average' | 'Risky';
    trustScore: number;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    verificationNote?: string;
    pendingPhone?: string;
    phoneUpdateOTP?: string;
    phoneUpdateOTPExpire?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['contractor', 'labour', 'admin'] },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        address: { type: String }
    },
    skills: { type: [String], default: [] },
    isSkilled: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    rank: {
        type: String,
        enum: ['Top Labour', 'Trusted', 'Reliable', 'Average', 'Risky'],
        default: 'Average'
    },
    trustScore: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    verificationNote: { type: String },
    pendingPhone: { type: String },
    phoneUpdateOTP: { type: String },
    phoneUpdateOTPExpire: { type: Date }
}, {
    timestamps: true
});

UserSchema.index({ location: '2dsphere' });
UserSchema.index({ role: 1 });
// phone is unique already so no need for explicit index


export default mongoose.model<IUser>('User', UserSchema);

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
    isVerified: boolean;
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
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true
});

UserSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', UserSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
    dealId: mongoose.Schema.Types.ObjectId;
    jobId: mongoose.Schema.Types.ObjectId;
    labourId: mongoose.Schema.Types.ObjectId;
    date: Date;
    timestamp: Date;
    location: {
        type: string;
        coordinates: number[];
        address?: string;
    };
    imageUrl: string;
    status: 'pending' | 'approved' | 'rejected';
}

const AttendanceSchema: Schema = new Schema({
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    labourId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [long, lat]
        address: { type: String }
    },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

AttendanceSchema.virtual('id').get(function (this: any) {
    return this._id.toHexString();
});

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);

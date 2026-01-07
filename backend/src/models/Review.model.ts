import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    dealId: mongoose.Schema.Types.ObjectId;
    reviewerId: mongoose.Schema.Types.ObjectId;
    reviewedUserId: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment?: string;
}

const ReviewSchema: Schema = new Schema({
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, {
    timestamps: true
});

ReviewSchema.index({ dealId: 1, reviewerId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);

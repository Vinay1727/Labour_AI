/**
 * Rating & Review System Types
 */

export interface Rating {
    ratingId: string;
    dealId: string;
    raterUserId: string;
    ratedUserId: string;
    roleOfRater: 'contractor' | 'labour';
    stars: 1 | 2 | 3 | 4 | 5;
    reviewText?: string;
    createdAt: string;
}

export interface UserRatingStats {
    averageRating: number;
    totalRatings: number;
}

export interface RatingSubmission {
    dealId: string;
    ratedUserId: string;
    stars: number;
    reviewText?: string;
}

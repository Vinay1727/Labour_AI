/**
 * Search API Standard Types
 * These interfaces reflect the production API contracts for Job and Labour search.
 */

// ------------------------------------------------
// COMMON TYPES
// ------------------------------------------------

export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export interface Location {
    area: string;
    city: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    message: string;
    errorCode: string;
}

// ------------------------------------------------
// JOBS API TYPES (FOR LABOUR)
// ------------------------------------------------

export interface Payment {
    amount: number;
    unit: 'per day' | 'per contract' | 'total';
}

export interface ContractorBrief {
    contractorId: string;
    name: string;
}

export interface Job {
    _id: string;
    contractorId: {
        _id: string;
        name: string;
        phone: string;
        averageRating?: number;
    };
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
        area?: string;
        city?: string;
    };
    status: 'open' | 'in_progress' | 'completed' | 'closed';
    createdAt: string;
    distanceKm?: number;
}

export interface JobSearchData {
    jobs: Job[];
    pagination: Pagination;
}

export type JobSearchResponse = ApiResponse<JobSearchData>;

// ------------------------------------------------
// LABOUR API TYPES (FOR CONTRACTOR)
// ------------------------------------------------

export interface Labour {
    _id: string;
    name: string;
    skills: string[];
    experienceYears?: number;
    location: {
        type: string;
        coordinates: number[];
        address?: string;
        area?: string;
        city?: string;
    };
    averageRating: number;
    reviewCount: number;
    rank?: 'Top Labour' | 'Trusted' | 'Reliable' | 'Average' | 'Risky';
    availability: 'today' | 'tomorrow' | 'unavailable';
}

export interface LabourSearchData {
    labours: Labour[];
    pagination: Pagination;
}

export type LabourSearchResponse = ApiResponse<LabourSearchData>;

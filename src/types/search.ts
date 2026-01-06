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
    jobId: string;
    workType: string;
    description: string;
    location: Location;
    distanceKm: number;
    duration: string;
    payment: Payment | null;
    contractor: ContractorBrief;
    status: 'open' | 'assigned' | 'closed';
    createdAt: string;
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
    labourId: string;
    name: string;
    skill: string;
    experienceYears: number;
    location: Location;
    rating: number | null;
    availability: 'today' | 'tomorrow' | 'unavailable';
    lastActive: string;
}

export interface LabourSearchData {
    labours: Labour[];
    pagination: Pagination;
}

export type LabourSearchResponse = ApiResponse<LabourSearchData>;

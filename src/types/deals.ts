/**
 * Deal Lifecycle Management Types
 */

export type DealStatus =
    | 'open'                 // Work posted, no labour assigned
    | 'applied'              // Labour applied
    | 'assigned'             // Contractor assigned labour
    | 'active'               // Business in progress
    | 'completion_requested' // Labour marked done, waiting for contractor
    | 'finished'             // Work approved, waiting for rating
    | 'completed'            // Both sides rated, terminal state
    | 'rejected'             // Application rejected
    | 'cancelled';           // Job cancelled by either party

export interface Deal {
    id: string;
    jobId: string;
    status: DealStatus;
    workType: string;
    location: {
        area: string;
        city: string;
    };
    date: string;
    payment?: string;
    appliedSkill?: string;

    // Participants
    contractorId: string;
    contractorName: string;
    labourId: string;
    labourName: string;
    userName?: string; // For UI display
    labourFinishRequested?: boolean;


    // Timestamps
    createdAt: string;
    updatedAt: string;
    completedAt?: string;

    isReviewed?: boolean;
    completionStatus?: 'requested' | 'approved' | 'rejected';
    rejectionHistory?: Array<{
        reasonCodes: string[];
        note?: string | null;
        rejectedAt: string;
    }>;

    // Attendance
    attendance?: AttendanceRecord[];
}

export interface AttendanceRecord {
    id: string;
    dealId: string;
    date: string;       // ISO Date YYYY-MM-DD
    timestamp: string;  // ISO Full Timestamp
    location: {
        type?: string;
        coordinates?: number[];
        latitude?: number;
        longitude?: number;
        address?: string;
    };
    imageUrl: string;
    status: 'pending' | 'approved' | 'rejected';
}

/**
 * Permission Logic Helpers
 */
export const canLabourMarkDone = (deal: Deal, currentUserId: string) => {
    return deal.status === 'active' && deal.labourId === currentUserId;
};

export const canContractorApprove = (deal: Deal, currentUserId: string) => {
    return deal.status === 'completion_requested' && deal.contractorId === currentUserId;
};

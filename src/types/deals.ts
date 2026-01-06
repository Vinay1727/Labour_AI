/**
 * Deal Lifecycle Management Types
 */

export type DealStatus =
    | 'open'                 // Work posted, no labour assigned
    | 'applied'              // Labour applied
    | 'assigned'             // Contractor assigned labour
    | 'active'               // Business in progress
    | 'completion_requested' // Labour marked done, waiting for contractor
    | 'completed';           // Contractor approved and closed

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

    // Participants
    contractorId: string;
    contractorName: string;
    labourId: string;
    labourName: string;
    userName?: string; // For UI display


    // Timestamps
    createdAt: string;
    updatedAt: string;
    completedAt?: string;

    // Attendance
    attendance?: AttendanceRecord[];
}

export interface AttendanceRecord {
    id: string;
    dealId: string;
    date: string;       // ISO Date YYYY-MM-DD
    timestamp: string;  // ISO Full Timestamp
    location: {
        latitude: number;
        longitude: number;
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

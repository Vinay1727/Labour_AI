/**
 * Deal Lifecycle Management Types
 */

export type DealStatus =
    | 'open'                 // Work posted, no labour assigned
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

    // Timestamps
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
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

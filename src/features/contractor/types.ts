export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    pay: string;
    status: 'open' | 'closed';
    contractorId: string;
}

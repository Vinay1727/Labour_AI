import User from '../models/User.model';
import Deal from '../models/Deal.model';
import Attendance from '../models/Attendance.model';
import mongoose from 'mongoose';

export const calculateLabourRank = async (labourId: string | mongoose.Types.ObjectId) => {
    try {
        const labour = await User.findById(labourId);
        if (!labour || labour.role !== 'labour') return;

        const deals = await Deal.find({ labourId });
        const totalDeals = deals.length;
        if (totalDeals === 0) {
            // New labours start as 'Average' or 'Trusted' depending on verification
            await User.findByIdAndUpdate(labourId, { rank: 'Average', trustScore: 50 });
            return;
        }

        const completedDeals = deals.filter(d => d.status === 'completed').length;
        const rejectedDeals = deals.filter(d => d.status === 'rejected').length;

        // 1. Job Completion Rate (30%)
        const completionRate = (completedDeals / totalDeals) * 100;
        const completionScore = completionRate * 0.3;

        // 2. Attendance Discipline (20%)
        const attendanceCount = await Attendance.countDocuments({ labourId, status: 'approved' });
        // Target is at least 1 attendance per completed deal
        const attendanceRate = Math.min((attendanceCount / (completedDeals || 1)) * 100, 100);
        const attendanceScore = attendanceRate * 0.2;

        // 3. Contractor Ratings (20%)
        // Normalized 0-5 to 0-100
        const ratingScore = (labour.averageRating / 5) * 100 * 0.2;

        // 4. Repeat Hire Rate (15%)
        const contractors = deals.map(d => d.contractorId.toString());
        const uniqueContractors = new Set(contractors).size;
        const repeatHires = totalDeals - uniqueContractors;
        const repeatHireRate = Math.min((repeatHires / totalDeals) * 100, 100);
        const repeatHireScore = repeatHireRate * 0.15;

        // 5. Recent Activity (15%)
        // Check deals in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentDealsCount = deals.filter(d => d.createdAt >= thirtyDaysAgo).length;
        const activityScore = Math.min(recentDealsCount * 10, 15); // Cap at 15 points

        // 6. Cancellation Penalty
        const penalty = rejectedDeals * 5; // -5 points for each rejection/cancellation

        // Final Calculation
        let finalScore = completionScore + attendanceScore + ratingScore + repeatHireScore + activityScore - penalty;

        // Normalize 0-100
        finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

        // Map to Rank Labels
        let rank: 'Top Labour' | 'Trusted' | 'Reliable' | 'Average' | 'Risky' = 'Average';
        if (finalScore >= 85) rank = 'Top Labour';
        else if (finalScore >= 70) rank = 'Trusted';
        else if (finalScore >= 50) rank = 'Reliable';
        else if (finalScore >= 30) rank = 'Average';
        else rank = 'Risky';

        await User.findByIdAndUpdate(labourId, {
            rank,
            trustScore: finalScore
        });

    } catch (e) {
        console.error('Ranking Calculation Error:', e);
    }
};

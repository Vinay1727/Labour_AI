import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Deal, AttendanceRecord } from '../../types/deals';

interface DealsState {
    deals: Deal[];
}

const initialState: DealsState = {
    deals: []
};

const dealsSlice = createSlice({
    name: 'deals',
    initialState,
    reducers: {
        setDeals: (state, action: PayloadAction<Deal[]>) => {
            state.deals = action.payload;
        },
        addAttendance: (state, action: PayloadAction<{ dealId: string; record: AttendanceRecord }>) => {
            const { dealId, record } = action.payload;
            const deal = state.deals.find(d => d.id === dealId);
            if (deal) {
                if (!deal.attendance) {
                    deal.attendance = [];
                }
                deal.attendance.push(record);
            }
        },
    },
});

export const { setDeals, addAttendance } = dealsSlice.actions;
export default dealsSlice.reducer;

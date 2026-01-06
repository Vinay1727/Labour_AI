import { createSlice } from '@reduxjs/toolkit';

const dealsSlice = createSlice({
    name: 'deals',
    initialState: { deals: [] },
    reducers: {
        setDeals: (state, action) => {
            state.deals = action.payload;
        },
    },
});

export const { setDeals } = dealsSlice.actions;
export default dealsSlice.reducer;

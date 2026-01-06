import { createSlice } from '@reduxjs/toolkit';

const labourSlice = createSlice({
    name: 'labour',
    initialState: { availableJobs: [] },
    reducers: {
        setAvailableJobs: (state, action) => {
            state.availableJobs = action.payload;
        },
    },
});

export const { setAvailableJobs } = labourSlice.actions;
export default labourSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const contractorSlice = createSlice({
    name: 'contractor',
    initialState: { jobs: [] },
    reducers: {
        setJobs: (state, action) => {
            state.jobs = action.payload;
        },
    },
});

export const { setJobs } = contractorSlice.actions;
export default contractorSlice.reducer;

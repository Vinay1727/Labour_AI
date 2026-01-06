// Redux slice placeholder
import { createSlice } from '@reduxjs/toolkit';
import { AuthState } from './types';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

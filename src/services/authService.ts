import { apiClient } from './apiClient';

export const authService = {
    sendOtp: (phone: string) => apiClient.post('/auth/send-otp', { phone }),
    verifyOtp: (phone: string, otp: string) => apiClient.post('/auth/verify-otp', { phone, otp }),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh-token'),
};

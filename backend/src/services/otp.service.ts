import axios from 'axios';
import { RAPID_API_KEY, RAPID_API_HOST } from '../config/env';

export const sendOTP = async (phone: string) => {
    try {
        const options = {
            method: 'POST',
            url: `https://${RAPID_API_HOST}/send-numeric-verify`,
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST,
                'Content-Type': 'application/json'
            },
            data: {
                target: phone.startsWith('+')
                    ? (phone.includes(' ') ? phone : `${phone.slice(0, 3)} ${phone.slice(3)}`)
                    : `+91 ${phone}`,
                estimate: false
            }
        };

        const response = await axios.request(options);
        console.log('OTP API Response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('OTP Send Error:', error.response?.data || error.message);
        // Fallback or rethrow? Let's rethrow to catch in controller
        throw error;
    }
};

export const verifyOTP = async (phone: string, token: string) => {
    try {
        const options = {
            method: 'POST',
            url: `https://${RAPID_API_HOST}/verify-sms`,
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST,
                'Content-Type': 'application/json'
            },
            data: {
                target: phone.startsWith('+')
                    ? (phone.includes(' ') ? phone : `${phone.slice(0, 3)} ${phone.slice(3)}`)
                    : `+91 ${phone}`,
                token: token
            }
        };

        const response = await axios.request(options);
        console.log('OTP Verify Response:', response.data);
        // Usually returns { success: true/false } or similar
        return response.data;
    } catch (error: any) {
        console.error('OTP Verify Error:', error.response?.data || error.message);
        return { success: false, message: 'Verification failed' };
    }
};

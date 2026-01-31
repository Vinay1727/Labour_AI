import axios from 'axios';
import { RAPID_API_KEY, RAPID_API_HOST } from '../config/env';

class OTPService {
    private readonly key = RAPID_API_KEY;
    private readonly host = RAPID_API_HOST;

    /**
     * Standardizes phone number to purely numeric format without +.
     * Example: 9630370764 -> 919630370764 (India prefix)
     */
    private normalizePhone(phone: string): string {
        const clean = phone.replace(/\D/g, '');
        // Ensure 91 prefix
        return clean.length === 10 ? `91${clean}` : clean;
    }

    // Generate a random 4 digit OTP
    generateOTP(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    async sendOTP(phone: string) {
        if (!this.key) throw new Error('OTP Service Configuration Error: Missing API Key');

        const targetPhone = this.normalizePhone(phone);
        const otp = this.generateOTP();

        console.log(`[OTP] Sending ${otp} to ${targetPhone} via ${this.host}`);

        try {
            // Using the new API endpoint structure observed from SMSly
            const response = await axios.get(`https://${this.host}/otp`, {
                params: {
                    phone: targetPhone,
                    otp: otp
                },
                headers: {
                    'x-rapidapi-key': this.key,
                    'x-rapidapi-host': this.host
                }
            });

            console.log('[OTP] Response:', response.data);
            return { success: true, otp };
        } catch (error: any) {
            console.error('[OTP-API Error]', error.response?.data || error.message);
            // Even if API fails, for dev we might want to know. 
            // In strict prod, we throw.
            throw new Error('Failed to send OTP via SMSly');
        }
    }

    async verifyOTP(phone: string, token: string, storedOTP?: string) {
        // Compare with locally stored OTP passed from controller
        if (storedOTP && token === storedOTP) {
            return { success: true, message: 'Verified locally' };
        }
        return { success: false, message: 'Invalid OTP' };
    }
}

export default new OTPService();

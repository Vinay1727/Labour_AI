import axios from 'axios';
import { RAPID_API_KEY, RAPID_API_HOST } from '../config/env';

class OTPService {
    private readonly key = RAPID_API_KEY;
    private readonly host = RAPID_API_HOST;

    /**
     * Standardizes phone number to E.164 format (+91XXXXXXXXXX)
     * Some APIs might fail with spaces, so we allow a toggle.
     */
    private normalizePhone(phone: string, includeSpace: boolean = false): string {
        const clean = phone.replace(/\D/g, ''); // Keep only digits
        // Ensure India code 91 is present
        // If length is 10, add 91. If 12 (91...), keep it.
        const withCode = clean.length === 10 ? `91${clean}` : clean;
        return withCode;
    }

    async sendOTP(phone: string) {
        if (!this.key) {
            console.error('[OTP] RAPID_API_KEY is missing in environment variables');
            throw new Error('OTP Service Configuration Error');
        }

        const targetPhone = this.normalizePhone(phone, true); // Using space as per your earlier log success
        console.log(`[OTP] Attempting to send SMS to: ${targetPhone}`);

        try {
            const { data } = await axios.post(
                `https://${this.host}/send-numeric-verify`,
                {
                    target: targetPhone,
                    estimate: false
                },
                {
                    headers: {
                        'x-rapidapi-key': this.key,
                        'x-rapidapi-host': this.host,
                        'Content-Type': 'application/json'
                    },
                    timeout: 8000 // 8 seconds timeout
                }
            );

            console.log('[OTP] Provider Response:', data);

            if (data.status === 'failed') {
                throw new Error(data.message || 'Provider rejected the request. Check country support.');
            }

            return { success: true, data };
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            console.error('[OTP] Send Failed:', errorMsg);
            throw new Error(`SMS_SEND_FAILED: ${errorMsg}`);
        }
    }

    async verifyOTP(phone: string, token: string) {
        const targetPhone = this.normalizePhone(phone, true);

        try {
            const { data } = await axios.post(
                `https://${this.host}/verify-sms`,
                {
                    target: targetPhone,
                    token: token
                },
                {
                    headers: {
                        'x-rapidapi-key': this.key,
                        'x-rapidapi-host': this.host,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: data.status === 'success' || data.success === true,
                message: data.message || (data.status === 'failed' ? 'Invalid OTP' : '')
            };
        } catch (error: any) {
            console.error('[OTP] Verify Error:', error.response?.data || error.message);
            return { success: false, message: 'OTP verification service unavailable' };
        }
    }
}

export default new OTPService();

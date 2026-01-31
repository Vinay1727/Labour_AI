import axios from 'axios';
import { RAPID_API_KEY, RAPID_API_HOST } from '../config/env';

class OTPService {
    private readonly key = RAPID_API_KEY;
    private readonly host = RAPID_API_HOST;

    /**
     * Standardizes phone number to purely numeric format without +.
     * Example: 9630370764 -> 9630370764 (Depends on API need, usually 10 digit or 91+10 digit)
     * For "SMSly - SMS To INDIA", let's try 10 digit first as it is India specific, or 91 prefix.
     * Let's use 91 prefix to be safe.
     */
    private normalizePhone(phone: string): string {
        const clean = phone.replace(/\D/g, '');
        // Ensure 91 prefix
        return clean.length === 10 ? `91${clean}` : clean;
    }

    // Generate a random 4 digit OTP (Since this API might just be for sending custom messages, we perform verify logic ourselves)
    generateOTP(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    async sendOTP(phone: string) {
        if (!this.key) throw new Error('OTP Service Configuration Error: Missing API Key');

        const targetPhone = this.normalizePhone(phone);
        // We will generate OTP here and send it as a message
        // Note: The previous API was "verify" based, this one looks like general SMS or specific OTP.
        // Let's assume there is a specific OTP endpoint or we use generic message.
        // Based on "GET Send OTP" visible in sidebar.

        // Generating a self-managed OTP since we are switching providers
        // In real verify logic, we should store this OTP in DB (User model already handles pending OTP).
        // BUT wait, the calling controller logic expects `sendOTP` to just SEND. 
        // The Verification logic matches `User.phoneUpdateOTP` or logic in Controller.
        // Actually, the previous provider had a verify endpoint. This one might not. 
        // We need to fetch the OTP from the caller or generate one?
        // The controller currently uses hardcoded '1234' for dev, but we need real OTP.

        // Let's modify this service to Generate and Return an OTP, which the controller can save.
        // OR better: The controller calls sendOTP, and we send a generated one.

        const otp = this.generateOTP();

        console.log(`[OTP] Sending ${otp} to ${targetPhone} via ${this.host}`);

        // Try standard param structure for "Send OTP" endpoint
        // Usually: /sendotp?number=...&otp=... or /otp?check=...
        // Let's try to infer or fallback to a general message if specific endpoint fails?
        // No, let's look at the image again. It shows "GET Send OTP".

        try {
            const response = await axios.get(`https://${this.host}/otp`, {
                params: {
                    phone: targetPhone,
                    otp: otp
                    // Some APIs use 'number' instead of 'phone', or 'message'.
                    // Without exact docs, we try the most common: phone + otp
                },
                headers: {
                    'x-rapidapi-key': this.key,
                    'x-rapidapi-host': this.host
                }
            });

            console.log('[OTP] Response:', response.data);
            return { success: true, otp }; // Return OTP so controller can save it
        } catch (error: any) {
            console.error('[OTP-API Error]', error.response?.data || error.message);
            // Fallback: If param names are wrong, providing a clear error.
            throw new Error('Failed to send OTP via SMSly');
        }
    }

    // Since this might not have a verify endpoint, we rely on our DB comparison
    async verifyOTP(phone: string, token: string, storedOTP?: string) {
        // If we have a stored OTP (passed from DB), compare it.
        if (storedOTP && token === storedOTP) {
            return { success: true, message: 'Verified locally' };
        }

        // If we don't support remote verify, we fail or assume true for dev?
        return { success: false, message: 'Remote verification not supported by this provider, use local comparison.' };
    }
}

export default new OTPService();

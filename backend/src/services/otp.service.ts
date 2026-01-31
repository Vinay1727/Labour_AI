import axios from "axios";
import { RAPID_API_KEY, RAPID_API_HOST, SMS_API_URL } from "../config/env";

class OTPService {
    private readonly apiKey: string = RAPID_API_KEY;
    private readonly apiHost: string = RAPID_API_HOST;
    private readonly apiUrl: string = SMS_API_URL;

    // Normalize phone number to +91XXXXXXXXXX
    private normalizePhone(phone: string): string {
        const clean = phone.replace(/\D/g, "");
        const formatted = clean.length === 10 ? `+91${clean}` : `+${clean}`;
        return formatted;
    }

    // Generate 4 digit OTP
    generateOTP(): string {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        return otp;
    }

    async sendOTP(phone: string) {
        // Check configuration
        if (!this.apiKey || !this.apiHost || !this.apiUrl) {
            throw new Error("OTP Service Configuration Error: Missing env variables");
        }

        const targetPhone = this.normalizePhone(phone);
        const otp = this.generateOTP();

        console.log(`[OTP] Sending ${otp} to ${targetPhone}`);

        try {
            const response = await axios.get(this.apiUrl, {
                params: {
                    phone: targetPhone,
                    otp: otp,
                },
                headers: {
                    "x-rapidapi-key": this.apiKey,
                    "x-rapidapi-host": this.apiHost,
                    "Content-Type": "application/json",
                },
            });

            console.log("[OTP] Response:", response.data);
            return { success: true, otp };
        } catch (error: any) {
            console.error(
                "[OTP-API Error]",
                error.response?.data || error.message
            );
            throw new Error(`Failed to send OTP: ${error.message}`);
        }
    }

    async verifyOTP(phone: string, token: string, storedOTP?: string) {
        if (storedOTP && token === storedOTP) {
            return { success: true, message: "Verified locally" };
        }
        return { success: false, message: "Invalid OTP" };
    }
}

export default new OTPService();

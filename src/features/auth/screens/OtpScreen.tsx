import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { authService } from '../../../services/authService';
import { storage } from '../../../utils/storage';

export const OtpScreen = ({ route, navigation }: any) => {
    const { phoneNumber } = route.params;
    const [otp, setOtp] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const { token, user, isNewUser } = await authService.verifyOtp(phoneNumber, otp) as any;
            await storage.setToken(token);
            await storage.setUser(user);

            // Dispatch to Redux (if applicable, though we might not have the hook here yet)
            // For now, assume simple nav

            if (isNewUser) {
                navigation.navigate('RoleSelection');
            } else {
                // Or navigate to Home/Contractor/Labour based on role
                // But typically RoleSelection handles the routing if role not set
                if (!user.role) {
                    navigation.navigate('RoleSelection');
                } else {
                    // Assuming we have a root navigator that checks auth, 
                    // or we manually nav to Main
                    // Simple restart or navigation reset might be needed
                    navigation.reset({
                        index: 0,
                        routes: [{ name: user.role === 'contractor' ? 'ContractorHome' : 'LabourHome' }], // Adjust screen names as per routes
                    });
                }
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Sent to +91 {phoneNumber}</Text>

            <TextInput
                style={styles.otpInput}
                placeholder="Enter OTP"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
            />

            <PrimaryButton
                title="Verify"
                onPress={handleVerify}
                disabled={otp.length !== 4 || isLoading}
                isLoading={isLoading}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    otpInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 16,
        borderRadius: 8,
        fontSize: 24,
        letterSpacing: 4,
        textAlign: 'center',
        marginBottom: 24,
        backgroundColor: '#fff',
    },
});

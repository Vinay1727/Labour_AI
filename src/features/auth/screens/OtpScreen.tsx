import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';

export const OtpScreen = ({ route, navigation }: any) => {
    const { phoneNumber } = route.params;
    const [otp, setOtp] = useState('');

    const handleVerify = () => {
        // Verify OTP API call
        // If new user -> RoleSelection
        // If existing -> Home
        navigation.navigate('RoleSelection');
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
                disabled={otp.length !== 6}
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

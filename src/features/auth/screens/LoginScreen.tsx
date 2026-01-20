import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { PhoneInput } from '../../../components/inputs/PhoneInput';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { authService } from '../../../services/authService';

export const LoginScreen = ({ navigation }: any) => {
    const [phone, setPhone] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || phone.length !== 10) return;

        setIsLoading(true);
        try {
            await authService.sendOtp(phone);
            navigation.navigate('OTP', { phoneNumber: phone });
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Enter your phone number to continue</Text>

            <View style={styles.form}>
                <PhoneInput
                    value={phone}
                    onChangeText={setPhone}
                />

                <PrimaryButton
                    title="Get OTP"
                    onPress={handleLogin}
                    disabled={phone.length !== 10 || isLoading}
                    isLoading={isLoading}
                />
            </View>
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
    form: {
        gap: 16,
    },
});

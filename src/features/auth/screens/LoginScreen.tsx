import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { PhoneInput } from '../../../components/inputs/PhoneInput';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';

export const LoginScreen = ({ navigation }: any) => {
    const [phone, setPhone] = useState('');

    const handleLogin = () => {
        // API call to send OTP
        navigation.navigate('OTP', { phoneNumber: phone });
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
                    disabled={phone.length !== 10}
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

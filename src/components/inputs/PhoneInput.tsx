import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface PhoneInputProps {
    value: string;
    onChangeText: (text: string) => void;
    label?: string;
    error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChangeText,
    label = 'Phone Number',
    error
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                <Text style={styles.prefix}>+91</Text>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType="phone-pad"
                    placeholder="9876543210"
                    maxLength={10}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: 'red',
    },
    prefix: {
        fontSize: 16,
        color: '#666',
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
});

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    isLoading = false,
    disabled = false
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    disabled: {
        backgroundColor: '#A0A0A0',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

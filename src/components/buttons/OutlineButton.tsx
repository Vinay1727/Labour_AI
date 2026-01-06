import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface OutlineButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
    title,
    onPress,
    disabled = false
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.text, disabled && styles.disabledText]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    disabled: {
        borderColor: '#A0A0A0',
    },
    text: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledText: {
        color: '#A0A0A0',
    },
});

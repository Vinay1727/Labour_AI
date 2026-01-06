import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RoleSelectorProps {
    onSelectRole: (role: 'contractor' | 'labour') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Role</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => onSelectRole('contractor')}
            >
                <Text style={styles.buttonText}>I am a Contractor</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.labourButton]}
                onPress={() => onSelectRole('labour')}
            >
                <Text style={styles.buttonText}>I am a Labourer</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: 24,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    labourButton: {
        backgroundColor: '#34C759',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

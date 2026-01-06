import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface LabourCardProps {
    name: string;
    skill: string;
    rating?: number;
    available: boolean;
    onPress: () => void;
}

export const LabourCard: React.FC<LabourCardProps> = ({
    name,
    skill,
    rating,
    available,
    onPress
}) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            </View>

            <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.skill}>{skill}</Text>
                {rating && <Text style={styles.rating}>⭐ {rating}</Text>}
            </View>

            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: available ? '#2ecc71' : '#e74c3c' }]} />
                <Text style={styles.statusText}>{available ? 'Available' : 'Busy'}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#555',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    skill: {
        fontSize: 14,
        color: '#666',
    },
    rating: {
        fontSize: 12,
        color: '#f1c40f',
        marginTop: 4,
    },
    statusContainer: {
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    statusText: {
        fontSize: 10,
        color: '#999',
    },
});

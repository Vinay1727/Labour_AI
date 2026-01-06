import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface JobCardProps {
    title: string;
    location: string;
    pay?: string;
    postedAt: string;
    onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
    title,
    location,
    pay,
    postedAt,
    onPress
}) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.location}>{location}</Text>
                {pay && <Text style={styles.pay}>{pay}</Text>}
                <Text style={styles.date}>{postedAt}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    pay: {
        fontSize: 16,
        color: '#2ecc71',
        fontWeight: '600',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#999',
        alignSelf: 'flex-end',
    },
});

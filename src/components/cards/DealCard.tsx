import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DealCardProps {
    jobTitle: string;
    contractorName: string;
    labourName: string;
    amount: string;
    status: 'pending' | 'accepted' | 'completed' | 'cancelled';
    onPress: () => void;
}

export const DealCard: React.FC<DealCardProps> = ({
    jobTitle,
    contractorName,
    labourName,
    amount,
    status,
    onPress
}) => {
    const getStatusColor = (status: DealCardProps['status']) => {
        switch (status) {
            case 'accepted': return '#2ecc71';
            case 'completed': return '#3498db';
            case 'cancelled': return '#e74c3c';
            case 'pending': return '#f39c12';
            default: return '#95a5a6';
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.jobTitle}>{jobTitle}</Text>
                <Text style={[styles.status, { color: getStatusColor(status) }]}>
                    {status.toUpperCase()}
                </Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.row}>Contractor: <Text style={styles.bold}>{contractorName}</Text></Text>
                <Text style={styles.row}>Labour: <Text style={styles.bold}>{labourName}</Text></Text>
                <Text style={styles.amount}>{amount}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF', // default accent
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    status: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    details: {

    },
    row: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    bold: {
        fontWeight: '600',
        color: '#333',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
        alignSelf: 'flex-end',
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon, AppIconName } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface InfoCardProps {
    icon: AppIconName;
    label: string;
    value: string;
}

export const InfoCard = ({ icon, label, value }: InfoCardProps) => {
    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <AppIcon name={icon} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.m,
        width: '48%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        marginBottom: spacing.m,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    label: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
});

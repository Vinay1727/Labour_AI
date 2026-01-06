import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon, AppIconName } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ProfileRowProps {
    icon: AppIconName;
    label: string;
    value: string;
}

export const ProfileRow = ({ icon, label, value }: ProfileRowProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <AppIcon name={icon} size={22} color={Colors.textLight} />
            </View>
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    iconContainer: {
        width: 40,
        marginRight: spacing.s,
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: Colors.textLight,
    },
    value: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
        marginTop: 2,
    },
});

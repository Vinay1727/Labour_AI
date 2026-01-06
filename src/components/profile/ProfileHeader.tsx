import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ProfileHeaderProps {
    name: string;
    role: 'contractor' | 'labour';
    location: string;
}

export const ProfileHeader = ({ name, role, location }: ProfileHeaderProps) => {
    const initial = name.charAt(0).toUpperCase();
    const isContractor = role === 'contractor';

    return (
        <View style={[styles.container, { backgroundColor: isContractor ? '#DBEAFE' : '#DCFCE7' }]}>
            <View style={styles.content}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <Text style={styles.name}>{name}</Text>
                <View style={[styles.roleBadge, { backgroundColor: isContractor ? Colors.primary : Colors.secondary }]}>
                    <Text style={styles.roleText}>{role === 'contractor' ? 'Contractor' : 'Labour'}</Text>
                </View>
                <View style={styles.locationContainer}>
                    <AppIcon name="location-outline" size={16} color={Colors.textLight} />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
        paddingTop: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    content: {
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        borderWidth: 4,
        borderColor: Colors.white,
        elevation: 4,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: spacing.s,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: spacing.s,
    },
    roleText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        marginLeft: 4,
        fontSize: 14,
        color: Colors.textLight,
    },
});

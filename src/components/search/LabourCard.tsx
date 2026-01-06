import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppButton } from '../common/AppButton';
import { Labour } from '../../types/search';

interface LabourCardProps {
    labour: Labour;
    onContact: (labourId: string) => void;
    onViewProfile: (labourId: string) => void;
}

export const LabourCard = ({ labour, onContact, onViewProfile }: LabourCardProps) => {
    const initial = labour.name.charAt(0);

    return (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.details}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{labour.name}</Text>
                        {labour.rating && (
                            <View style={styles.ratingBadge}>
                                <AppIcon name="star" size={12} color="#F59E0B" />
                                <Text style={styles.ratingText}>{labour.rating.toFixed(1)}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.skillText}>{labour.skill}</Text>
                    <Text style={styles.experienceText}>{labour.experienceYears} Years Experience</Text>
                </View>
            </View>

            <View style={styles.statusRow}>
                <View style={styles.locationContainer}>
                    <AppIcon name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{labour.location.area}, {labour.location.city}</Text>
                </View>
                <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: labour.availability === 'unavailable' ? Colors.errorLight : Colors.secondaryLight }
                ]}>
                    <Text style={[
                        styles.availabilityText,
                        { color: labour.availability === 'unavailable' ? Colors.error : Colors.secondary }
                    ]}>
                        {labour.availability === 'today' ? 'Available Today' : labour.availability === 'tomorrow' ? 'Available Tomorrow' : 'Busy'}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <AppButton
                    title="Contact"
                    onPress={() => onContact(labour.labourId)}
                    style={styles.contactBtn}
                    textStyle={styles.btnText}
                    icon={<AppIcon name="chatbubble-ellipses-outline" size={18} color={Colors.white} />}
                />
                <AppButton
                    title="Profile"
                    onPress={() => onViewProfile(labour.labourId)}
                    type="secondary"
                    style={styles.profileBtn}
                    textStyle={styles.btnText}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 3,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    userInfo: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 17,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: typography.weight.bold,
        color: '#B45309',
        marginLeft: 2,
    },
    skillText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: typography.weight.semiBold,
        marginTop: 2,
    },
    experienceText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        backgroundColor: Colors.textInput,
        padding: 10,
        borderRadius: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationText: {
        fontSize: 13,
        color: Colors.textPrimary,
        marginLeft: 4,
    },
    availabilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    availabilityText: {
        fontSize: 11,
        fontWeight: typography.weight.bold,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    contactBtn: {
        flex: 1.2,
        height: 44,
        borderRadius: 10,
    },
    profileBtn: {
        flex: 1,
        height: 44,
        borderRadius: 10,
    },
    btnText: {
        fontSize: 14,
    }
});

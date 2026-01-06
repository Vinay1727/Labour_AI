import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppButton } from '../common/AppButton';
import { Job } from '../../types/search';

interface WorkCardProps {
    work: Job;
    onApply: (jobId: string) => void;
    onViewDetails: (jobId: string) => void;
}

export const WorkCard = ({ work, onApply, onViewDetails }: WorkCardProps) => {
    const formattedPrice = work.payment
        ? `₹${work.payment.amount}/${work.payment.unit === 'per day' ? 'day' : 'work'}`
        : 'Negotiable';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.workTitle}>{work.workType}</Text>
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{work.duration}</Text>
                    </View>
                </View>
                <Text style={styles.priceText}>{formattedPrice}</Text>
            </View>

            <View style={styles.locationRow}>
                <AppIcon name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{work.location.area}, {work.location.city} • {work.distanceKm} km</Text>
            </View>

            <View style={styles.footer}>
                <AppButton
                    title="Apply"
                    onPress={() => onApply(work.jobId)}
                    style={styles.applyBtn}
                    textStyle={styles.btnText}
                />
                <AppButton
                    title="Details"
                    onPress={() => onViewDetails(work.jobId)}
                    type="secondary"
                    style={styles.detailsBtn}
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
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    titleContainer: {
        flex: 1,
    },
    workTitle: {
        fontSize: typography.size.sectionTitle,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    durationBadge: {
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    durationText: {
        fontSize: 11,
        color: Colors.primary,
        fontWeight: typography.weight.bold,
    },
    priceText: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.success,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    locationText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    applyBtn: {
        flex: 1.5,
        height: 44,
        borderRadius: 10,
    },
    detailsBtn: {
        flex: 1,
        height: 44,
        borderRadius: 10,
    },
    btnText: {
        fontSize: 14,
    }
});

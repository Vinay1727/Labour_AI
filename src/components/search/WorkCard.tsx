import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Job } from '../../types/search';
import { useTranslation } from '../../context/LanguageContext';

interface WorkCardProps {
    work: Job;
    onApply: (jobId: string) => void;
    onViewDetails: (jobId: string) => void;
}

export const WorkCard = ({ work, onApply, onViewDetails }: WorkCardProps) => {
    const { t } = useTranslation();

    const paymentLabel = work.paymentType === 'per_day' ? t('per_day') : t('fixed_contract');

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onViewDetails(work._id)}
        >
            <View style={styles.header}>
                <View style={styles.mainInfo}>
                    <Text style={styles.workTitle}>{work.workType}</Text>
                    <View style={styles.contractorRow}>
                        <AppIcon name="person-circle-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.contractorName}>{work.contractorId?.name || 'Contractor'}</Text>
                        {work.contractorId?.averageRating ? (
                            <View style={styles.ratingBadge}>
                                <AppIcon name="star" size={10} color="#F59E0B" />
                                <Text style={styles.ratingText}>{work.contractorId.averageRating}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                <View style={styles.paymentContainer}>
                    <Text style={styles.paymentAmount}>₹{work.paymentAmount}</Text>
                    <Text style={styles.paymentType}>{paymentLabel}</Text>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <AppIcon name="location-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {work.location.area || work.location.address || 'Nearby'}
                    </Text>
                </View>
                <View style={styles.detailItem}>
                    <AppIcon name="people-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>
                        {work.filledWorkers}/{work.requiredWorkers} {t('worker')}
                    </Text>
                </View>
            </View>

            {work.description ? (
                <Text style={styles.description} numberOfLines={2}>
                    {work.description}
                </Text>
            ) : null}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => onApply(work._id)}
                >
                    <Text style={styles.applyBtnText}>{t('apply').toUpperCase()}</Text>
                    <AppIcon name="chevron-forward" size={16} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: spacing.l,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 8,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    mainInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    workTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    contractorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    contractorName: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 2,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B45309',
    },
    paymentContainer: {
        alignItems: 'flex-end',
    },
    paymentAmount: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.success,
    },
    paymentType: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailsGrid: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flex: 1,
    },
    detailText: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: spacing.md,
    },
    actions: {
        marginTop: spacing.xs,
    },
    applyBtn: {
        backgroundColor: Colors.primary,
        height: 50,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    applyBtnText: {
        color: Colors.white,
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    }
});

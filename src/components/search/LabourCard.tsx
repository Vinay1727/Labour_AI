import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Labour } from '../../types/search';
import { useTranslation } from '../../context/LanguageContext';

interface LabourCardProps {
    labour: Labour;
    onContact: (labourId: string) => void;
    onViewProfile: (labour: Labour) => void;
}

export const LabourCard = ({ labour, onContact, onViewProfile }: LabourCardProps) => {
    const { t } = useTranslation();
    const initial = labour.name.charAt(0);

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onViewProfile(labour)}
        >
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{labour.name}</Text>
                        <View style={styles.ratingBadge}>
                            <AppIcon name="star" size={12} color="#F59E0B" />
                            <Text style={styles.ratingText}>{labour.averageRating?.toFixed(1) || '0.0'}</Text>
                            <Text style={styles.reviewCount}>({labour.reviewCount || 0})</Text>
                        </View>
                    </View>
                    {labour.rank && (
                        <View style={[styles.rankBadge, {
                            backgroundColor: labour.rank === 'Top Labour' ? '#FEF3C7' :
                                labour.rank === 'Trusted' ? '#DCFCE7' : '#F1F5F9'
                        }]}>
                            <AppIcon name="ribbon-outline" size={12} color={labour.rank === 'Top Labour' ? '#D97706' : '#059669'} />
                            <Text style={[styles.rankText, {
                                color: labour.rank === 'Top Labour' ? '#D97706' :
                                    labour.rank === 'Trusted' ? '#059669' : Colors.textSecondary
                            }]}>{labour.rank}</Text>
                        </View>
                    )}
                    <Text style={styles.skillText}>{labour.skills?.join(', ') || 'General Labour'}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <AppIcon name="briefcase-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>{labour.reviewCount || 0} {t('works' as any)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <AppIcon name="location-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>{labour.location.area || 'Nearby'}</Text>
                        </View>
                        {(labour as any).distance !== undefined && (
                            <View style={[styles.metaItem, styles.distanceBadge]}>
                                <AppIcon name="navigate-outline" size={12} color={Colors.primary} />
                                <Text style={[styles.metaText, { color: Colors.primary, fontWeight: '700' }]}>
                                    {((labour as any).distance / 1000).toFixed(1)} km away
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.contactBtn}
                    onPress={() => onContact(labour._id)}
                >
                    <AppIcon name="chatbubble-ellipses" size={18} color={Colors.white} />
                    <Text style={styles.contactBtnText}>{t('contact' as any)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => onViewProfile(labour)}
                >
                    <Text style={styles.profileBtnText}>{t('view_profile' as any)}</Text>
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
        elevation: 5,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        marginBottom: spacing.l,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#B45309',
    },
    reviewCount: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    skillText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '700',
        marginBottom: 8,
    },
    rankBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginBottom: 6, gap: 4 },
    rankText: { fontSize: 10, fontWeight: 'bold' },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    distanceBadge: {
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    contactBtn: {
        flex: 1.5,
        backgroundColor: Colors.primary,
        height: 48,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    contactBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    profileBtn: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileBtnText: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    }
});

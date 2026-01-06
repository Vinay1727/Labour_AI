import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../theme/typography';
import { useTranslation } from '../../context/LanguageContext';
import { DealStatus, Deal } from '../../types/deals';

interface DealCardProps {
    deal: Deal;
    role: 'contractor' | 'labour';
    onViewDetails: () => void;
    onUpdateStatus: (newStatus: DealStatus) => void;
}

export const DealCard = ({ deal, role, onViewDetails, onUpdateStatus }: DealCardProps) => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { t } = useTranslation();
    const isContractor = role === 'contractor';

    const getStatusInfo = () => {
        switch (deal.status) {
            case 'active':
                return { label: t('in_progress'), color: Colors.success, bg: Colors.secondaryLight };
            case 'completion_requested':
                return { label: t('pending_approval'), color: Colors.warning, bg: '#FFFBEB' };
            case 'completed':
                return { label: t('finished'), color: Colors.primary, bg: Colors.primaryLight };
            case 'open':
                return { label: t('looking_for_labour'), color: Colors.textSecondary, bg: Colors.textInput };
            default:
                return { label: deal.status, color: Colors.textSecondary, bg: Colors.textInput };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.workTypeContainer}>
                    <Text style={styles.workTitle}>{deal.workType}</Text>
                    <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                </View>
                <Text style={styles.date}>{deal.date}</Text>
            </View>

            <View style={styles.infoRow}>
                <AppIcon name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                    {`${deal.location.area}, ${deal.location.city}`}
                </Text>
            </View>

            <View style={styles.userRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(deal.userName || deal.contractorName || '?').charAt(0)}</Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userLabel}>{isContractor ? t('worker') : t('contractor')}</Text>
                    <Text style={styles.userName}>{deal.userName || deal.contractorName}</Text>
                </View>
                {deal.payment && (
                    <View style={styles.paymentContainer}>
                        <Text style={styles.paymentLabel}>{t('approx_payment')}</Text>
                        <Text style={styles.paymentValue}>{deal.payment}</Text>
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.detailsBtn} onPress={onViewDetails} activeOpacity={0.7}>
                    <Text style={styles.detailsBtnText}>{t('view_details')}</Text>
                </TouchableOpacity>

                <View style={styles.rightActions}>
                    {/* Labour Actions: Mark Done ONLY if assigned and active */}
                    {!isContractor &&
                        deal.status === 'active' &&
                        deal.labourId === user?.id && (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.secondary }]}
                                    onPress={() => navigation.navigate('Attendance', { dealId: deal.id })}
                                >
                                    <Text style={styles.actionBtnText}>{t('mark_attendance')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                                    onPress={() => onUpdateStatus('completion_requested')}
                                >
                                    <Text style={styles.actionBtnText}>{t('mark_done')}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    {/* Contractor Actions */}
                    {isContractor && deal.attendance && deal.attendance.length > 0 && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: Colors.info }]}
                            onPress={() => navigation.navigate('AttendanceHistory', { dealId: deal.id })}
                        >
                            <Text style={styles.actionBtnText}>{t('view_attendance')}</Text>
                        </TouchableOpacity>
                    )}

                    {isContractor && deal.status === 'completion_requested' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                            onPress={() => onUpdateStatus('completed')}
                        >
                            <Text style={styles.actionBtnText}>{t('approve')}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Universal Message Icon for any active/pending work */}
                    {(deal.status === 'active' || deal.status === 'completion_requested') && (
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => navigation.navigate('Chat', { name: deal.userName, workType: deal.workType })}
                        >
                            <AppIcon name="chatbubble-ellipses-outline" size={22} color={Colors.white} />
                        </TouchableOpacity>
                    )}

                    {deal.status === 'completed' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
                            onPress={() => navigation.navigate('Rating', {
                                dealId: deal.id,
                                name: deal.userName,
                                ratedUserId: 'mock_id'
                            })}
                        >
                            <AppIcon name="star" size={16} color={Colors.white} />
                            <Text style={styles.actionBtnText}>{t('rate')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
        elevation: 3,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    workTypeContainer: {
        flex: 1,
    },
    workTitle: {
        fontSize: typography.size.sectionTitle,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: typography.weight.bold,
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.textInput,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: Colors.white,
        fontWeight: typography.weight.bold,
        fontSize: 16,
    },
    userDetails: {
        flex: 1,
    },
    userLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 14,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
    },
    paymentContainer: {
        alignItems: 'flex-end',
    },
    paymentLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: typography.weight.bold,
        color: Colors.success,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    detailsBtnText: {
        color: Colors.textPrimary,
        fontWeight: typography.weight.semiBold,
        fontSize: 14,
    },
    rightActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    actionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minWidth: 90,
    },
    actionBtnText: {
        color: Colors.white,
        fontWeight: typography.weight.bold,
        fontSize: 14,
    },
    completedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
    },
    completedTabText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.primary,
    }
});

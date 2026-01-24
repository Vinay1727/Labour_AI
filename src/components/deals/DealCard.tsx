import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
    onRatePress: () => void;
    onViewProfile?: () => void;
}

export const DealCard = ({ deal, role, onViewDetails, onUpdateStatus, onRatePress, onViewProfile }: DealCardProps) => {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { t } = useTranslation();
    const isContractor = role === 'contractor';

    const getStatusInfo = () => {
        // Special Case: Completion Rejected
        if (deal.completionStatus === 'rejected' && deal.status === 'active') {
            return {
                label: 'Rejected',
                color: Colors.error,
                bg: '#FEF2F2',
                icon: 'close-circle-outline'
            };
        }

        switch (deal.status) {
            case 'applied':
                return { label: t('applied'), color: '#64748B', bg: '#F1F5F9', icon: 'timer-outline' };
            case 'active':
                return { label: t('in_progress'), color: '#F59E0B', bg: '#FFFBEB', icon: 'hammer-outline' };
            case 'completion_requested':
                return { label: t('pending_approval'), color: '#3B82F6', bg: '#EFF6FF', icon: 'sync-outline' };
            case 'finished':
                return { label: t('work_done'), color: Colors.primary, bg: Colors.primaryLight, icon: 'checkmark-done-circle-outline' };
            case 'completed':
                return { label: t('fully_completed'), color: Colors.success, bg: '#DCFCE7', icon: 'star' };
            case 'rejected':
                return { label: t('rejected'), color: Colors.error, bg: '#FEF2F2', icon: 'close-circle-outline' };
            case 'cancelled':
                return { label: t('cancelled' as any), color: Colors.error, bg: '#FEF2F2', icon: 'trash-outline' };
            default:
                return { label: deal.status, color: Colors.textSecondary, bg: Colors.textInput, icon: 'help-circle-outline' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.workTypeContainer}>
                    <Text style={styles.workTitle} numberOfLines={1}>{deal.appliedSkill || deal.workType}</Text>
                    <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                        <AppIcon name={statusInfo.icon as any} size={14} color={statusInfo.color} />
                        <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                </View>
                <Text style={styles.date}>{deal.date}</Text>
            </View>

            <View style={styles.infoRow}>
                <AppIcon name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                    {`${deal.location?.area || t('local' as any)}, ${deal.location?.city || t('nearby' as any)}`}
                </Text>
            </View>

            <View style={styles.userRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(deal.userName || deal.contractorName || '?').charAt(0)}</Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userLabel}>{isContractor ? t('worker') : t('contractor')}</Text>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName} numberOfLines={1}>{deal.userName || deal.contractorName}</Text>
                        {isContractor && (deal.labourId as any)?.averageRating && (
                            <View style={styles.miniRatingBadge}>
                                <AppIcon name="star" size={10} color="#F59E0B" />
                                <Text style={styles.miniRatingText}>{(deal.labourId as any).averageRating}</Text>
                            </View>
                        )}
                        {isContractor && !(deal.labourId as any)?.averageRating && (
                            <View style={[styles.miniRatingBadge, { backgroundColor: '#DBEAFE' }]}>
                                <Text style={[styles.miniRatingText, { color: Colors.primary }]}>NEW</Text>
                            </View>
                        )}
                    </View>
                </View>
                {deal.payment && (
                    <View style={styles.paymentContainer}>
                        <Text style={styles.paymentLabel}>{t('approx_payment')}</Text>
                        <Text style={styles.paymentValue}>{deal.payment}</Text>
                    </View>
                )}
            </View>

            {/* Rejection Notification for Labour */}
            {!isContractor && deal.completionStatus === 'rejected' && deal.status === 'active' && deal.rejectionHistory && deal.rejectionHistory.length > 0 && (
                <View style={styles.rejectionBox}>
                    <View style={styles.rejectionHeader}>
                        <AppIcon name="warning-outline" size={16} color={Colors.error} />
                        <Text style={styles.rejectionTitle}>Kaam check kariye (Rejected)</Text>
                    </View>
                    <Text style={styles.rejectionText}>
                        Contractor feedback: {deal.rejectionHistory[deal.rejectionHistory.length - 1].reasonCodes.join(', ')}
                    </Text>
                    {deal.rejectionHistory[deal.rejectionHistory.length - 1].note && (
                        <Text style={styles.rejectionNote}>"{deal.rejectionHistory[deal.rejectionHistory.length - 1].note}"</Text>
                    )}
                </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity style={styles.detailsBtn} onPress={onViewDetails} activeOpacity={0.7}>
                    <AppIcon name="eye-outline" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.rightActions}>
                    {/* 1. APPLICATIONS PHASE */}
                    {(deal.status === 'applied' || deal.status === 'rejected') && isContractor && (
                        <View style={styles.appliedActions}>
                            <TouchableOpacity
                                style={styles.viewProfileBtn}
                                onPress={onViewProfile}
                            >
                                <AppIcon name="person-outline" size={16} color={Colors.primary} />
                                <Text style={styles.viewProfileText} numberOfLines={1}>{t('view_profile' as any)}</Text>
                            </TouchableOpacity>

                            <View style={styles.decisionActions}>
                                <TouchableOpacity
                                    style={[styles.miniRoundBtn, { backgroundColor: Colors.success }]}
                                    onPress={() => onUpdateStatus('approve_with_skill' as any)}
                                >
                                    <AppIcon name="checkmark" size={18} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.miniRoundBtn, { backgroundColor: Colors.error }]}
                                    onPress={() => onUpdateStatus('rejected')}
                                >
                                    <AppIcon name="close" size={18} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* 2. IN PROGRESS PHASE (Labour Actions) */}
                    {!isContractor && deal.status === 'active' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: Colors.secondary }]}
                            onPress={() => onUpdateStatus('completion_requested')}
                        >
                            <AppIcon name="flag" size={18} color={Colors.white} />
                            <Text style={styles.actionButtonText}>Finish</Text>
                        </TouchableOpacity>
                    )}

                    {/* 3. COMPLETION APPROVAL PHASE (Contractor Actions) */}
                    {isContractor && deal.status === 'completion_requested' && (
                        <View style={styles.decisionActions}>
                            <TouchableOpacity
                                style={[styles.miniRoundBtn, { backgroundColor: Colors.success }]}
                                onPress={() => onUpdateStatus('completed')}
                            >
                                <AppIcon name="checkmark-done" size={18} color={Colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.miniRoundBtn, { backgroundColor: Colors.error }]}
                                onPress={() => onUpdateStatus('rejected_completion' as any)}
                            >
                                <AppIcon name="close" size={18} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {!isContractor && deal.status === 'completion_requested' && (
                        <View style={styles.pendingBadge}>
                            <AppIcon name="time-outline" size={14} color="#B45309" />
                            <Text style={styles.pendingText}>{t('waiting_for_approval')}</Text>
                        </View>
                    )}

                    {!isContractor && deal.completionStatus === 'rejected' && deal.status === 'active' && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                            onPress={() => onUpdateStatus('completion_requested')}
                        >
                            <AppIcon name="hammer-outline" size={18} color={Colors.white} />
                            <Text style={styles.actionButtonText}>Resubmit</Text>
                        </TouchableOpacity>
                    )}

                    {/* COMMUNICATION & MGMT ACTIONS */}
                    {(['assigned', 'active', 'completion_requested', 'finished', 'completed'].includes(deal.status)) && (
                        <View style={styles.commActions}>
                            {/* Chat */}
                            <TouchableOpacity
                                style={styles.iconActionBtn}
                                onPress={() => navigation.navigate('Chat', {
                                    dealId: deal.id,
                                    name: isContractor ? deal.userName : deal.contractorName,
                                    workType: deal.workType
                                })}
                            >
                                <AppIcon name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
                            </TouchableOpacity>

                            {/* Call (Contractor ONLY) */}
                            {isContractor && (
                                <TouchableOpacity
                                    style={styles.iconActionBtn}
                                    onPress={() => {
                                        Alert.alert('Calling...', `Connecting you to ${deal.userName}`);
                                    }}
                                >
                                    <AppIcon name="call-outline" size={18} color={Colors.info} />
                                </TouchableOpacity>
                            )}

                            {/* Attendance (Labour ONLY) */}
                            {!isContractor && (
                                <TouchableOpacity
                                    style={styles.iconActionBtn}
                                    onPress={() => navigation.navigate('Attendance', { dealId: deal.id })}
                                >
                                    <AppIcon name="calendar-outline" size={18} color="#8B5CF6" />
                                </TouchableOpacity>
                            )}

                            {/* Cancel */}
                            {['assigned', 'active', 'completion_requested', 'applied'].includes(deal.status) && (
                                <TouchableOpacity
                                    style={styles.iconActionBtn}
                                    onPress={() => onUpdateStatus('cancelled' as any)}
                                >
                                    <AppIcon name="close-circle-outline" size={18} color={Colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* 4. COMPLETED / FINISHED PHASE (Rating) */}
                    {(deal.status === 'finished' || deal.status === 'completed') && (
                        deal.isReviewed ? (
                            <View style={styles.completedTag}>
                                <AppIcon name="star" size={18} color="#F59E0B" />
                                <Text style={styles.completedTabText}>{deal.status === 'completed' ? t('fully_completed') : t('rating_summary')}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: Colors.warning }]}
                                onPress={onRatePress}
                            >
                                <AppIcon name="star" size={18} color={Colors.white} />
                                <Text style={styles.actionButtonText}>Rate</Text>
                            </TouchableOpacity>
                        )
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
        marginBottom: spacing.sm,
        elevation: 2,
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
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
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        flex: 1,
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
        marginTop: spacing.xs,
        flexWrap: 'wrap',
        gap: 8,
    },
    detailsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightActions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
    },
    commActions: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    iconActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    miniRoundBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        gap: 6,
    },
    pendingText: {
        color: '#B45309',
        fontSize: 11,
        fontWeight: 'bold',
    },
    completedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#F0FDF4',
        borderRadius: 10,
    },
    completedTabText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.success,
    },
    rejectionBox: {
        backgroundColor: '#FFF1F2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FECDD3',
    },
    rejectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    rejectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.error,
    },
    rejectionText: {
        fontSize: 12,
        color: '#9F1239',
        fontWeight: '500',
    },
    rejectionNote: {
        fontSize: 12,
        color: '#BE123C',
        fontStyle: 'italic',
        marginTop: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniRatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
    },
    miniRatingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9A3412',
    },
    appliedActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },
    decisionActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    viewProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DBEAFE',
        gap: 4,
        maxWidth: 100,
    },
    viewProfileText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});


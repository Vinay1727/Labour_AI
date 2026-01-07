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
                    {/* 1. APPLICATIONS PHASE */}
                    {deal.status === 'applied' && isContractor && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                                onPress={() => onUpdateStatus('active')}
                            >
                                <Text style={styles.actionBtnText}>{t('accept')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.error }]}
                                onPress={() => onUpdateStatus('rejected')}
                            >
                                <Text style={styles.actionBtnText}>{t('ignore')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* 2. IN PROGRESS PHASE (Labour Actions) */}
                    {!isContractor && deal.status === 'active' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.secondary }]}
                                onPress={() => onUpdateStatus('completion_requested')}
                            >
                                <Text style={styles.actionBtnText}>{t('mark_done')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* 3. COMPLETION APPROVAL PHASE (Contractor Actions) */}
                    {isContractor && deal.status === 'completion_requested' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                                onPress={() => onUpdateStatus('completed')}
                            >
                                <AppIcon name="checkmark-done-circle" size={16} color={Colors.white} />
                                <Text style={styles.actionBtnText}>{t('approve_finish')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.error }]}
                                onPress={() => onUpdateStatus('active')}
                            >
                                <Text style={styles.actionBtnText}>{t('reject_continue')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {!isContractor && deal.status === 'completion_requested' && (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>{t('waiting_for_approval')}</Text>
                        </View>
                    )}

                    {/* APPROVED & ACTIVE PHASE ACTIONS */}
                    {(deal.status === 'assigned' || deal.status === 'active' || deal.status === 'completion_requested' || deal.status === 'completed') && (
                        <>
                            {/* Chat Button (Both Labour & Contractor) */}
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => navigation.navigate('Chat', {
                                    dealId: deal.id,
                                    name: isContractor ? deal.userName : deal.contractorName,
                                    workType: deal.workType
                                })}
                            >
                                <AppIcon name="chatbubble-ellipses-outline" size={22} color={Colors.white} />
                            </TouchableOpacity>

                            {/* Call Button (Contractor ONLY) */}
                            {isContractor && (
                                <TouchableOpacity
                                    style={[styles.iconBtn, { marginLeft: spacing.s }]}
                                    onPress={() => {
                                        // Trigger call logic
                                        Alert.alert('Calling...', `Connecting you to ${deal.userName}`);
                                    }}
                                >
                                    <AppIcon name="call-outline" size={22} color={Colors.white} />
                                </TouchableOpacity>
                            )}

                            {/* Attendance History (Contractor) / Mark Attendance (Labour) */}
                            {isContractor ? (
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: Colors.info }]}
                                    onPress={() => navigation.navigate('AttendanceHistory', { dealId: deal.id })}
                                >
                                    <AppIcon name="calendar-outline" size={16} color={Colors.white} />
                                    <Text style={styles.actionBtnText}>{t('view_attendance')}</Text>
                                </TouchableOpacity>
                            ) : (
                                deal.status === 'active' && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: Colors.info }]}
                                        onPress={() => navigation.navigate('Attendance', { dealId: deal.id })}
                                    >
                                        <AppIcon name="calendar-outline" size={16} color={Colors.white} />
                                        <Text style={styles.actionBtnText}>{t('mark_attendance')}</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </>
                    )}

                    {/* 4. COMPLETED PHASE (Rating) */}
                    {deal.status === 'completed' && (
                        deal.isReviewed ? (
                            <View style={styles.completedTag}>
                                <AppIcon name="star" size={16} color={Colors.primary} />
                                <Text style={styles.completedTabText}>{t('completed')}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
                                onPress={() => navigation.navigate('Rating', {
                                    dealId: deal.id,
                                    name: deal.userName,
                                    ratedUserId: isContractor ? deal.labourId : deal.contractorId
                                })}
                            >
                                <AppIcon name="star" size={16} color={Colors.white} />
                                <Text style={styles.actionBtnText}>{t('rate')}</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        </View >
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
        alignItems: 'flex-end', // Align to bottom
        marginTop: spacing.sm,
    },
    detailsBtn: {
        height: 40,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsBtnText: {
        color: Colors.textPrimary,
        fontWeight: typography.weight.semiBold,
        fontSize: 13,
    },
    rightActions: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexWrap: 'wrap', // Allow wrapping if many buttons
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 10, // Match actionBtn radius
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    pendingBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    pendingText: {
        color: '#B45309',
        fontSize: 11,
        fontWeight: 'bold',
    },
    actionBtn: {
        height: 40,
        paddingHorizontal: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: 80,
    },
    actionBtnText: {
        color: Colors.white,
        fontWeight: typography.weight.bold,
        fontSize: 13,
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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/common/AppButton';
import { useTranslation } from '../context/LanguageContext';
import { DealStatus } from '../types/deals';

export default function DetailsScreen({ route, navigation }: any) {
    const { role, user } = useAuth();
    const { itemId, itemType, initialStatus, fromDeals } = route.params || {};
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<DealStatus>(initialStatus || 'active');
    const [data, setData] = useState<any>(null);

    const isContractor = role === 'contractor';

    useEffect(() => {
        // Simulate API Call
        setTimeout(() => {
            if (itemType === 'labour') {
                setData({
                    id: itemId || 'lab_123',
                    name: 'Sunil Kumar',
                    skill: 'Mistri (Mason)',
                    rating: 4.8,
                    distance: '1.2 km',
                    joinedDate: 'Jan 2024',
                    jobsCompleted: 45,
                    avgRating: 4.8,
                    lastActive: '10 mins ago',
                    area: 'Sector 62',
                    city: 'Noida',
                    verified: true,
                });
            } else {
                setData({
                    id: itemId || 'job_456',
                    title: 'House Painting',
                    status: status,
                    area: 'DLF Phase 3',
                    city: 'Gurgaon',
                    duration: '3 Days',
                    payment: '₹600/day',
                    labourRequired: 5,
                    labourAccepted: 3,
                    labourApproved: 2,
                    contractorName: 'Vinay Builders',
                    contractorLocation: 'Gurgaon',
                    assignedLabourId: 'lab_001', // Mock assigned to current user for testing
                });
            }
            setLoading(false);
        }, 800);
    }, [itemId, itemType]);

    const handleUpdateStatus = (newStatus: DealStatus, confirmMsg: string) => {
        Alert.alert(
            t('details'),
            confirmMsg,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Confirm",
                    onPress: () => {
                        setLoading(true);
                        setTimeout(() => {
                            setStatus(newStatus);
                            setLoading(false);
                            Alert.alert(t('completed'), `${t('completed')}!`);
                        }, 500);
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>{t('loading_details')}</Text>
            </View>
        );
    }

    const renderLabourDetails = () => (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>{data.name.charAt(0)}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.profileName}>{data.name}</Text>
                        {data.verified && <AppIcon name="shield-checkmark" size={20} color={Colors.primary} />}
                    </View>
                    <Text style={styles.profileSkill}>{data.skill}</Text>
                    <View style={styles.ratingRow}>
                        <AppIcon name="star" size={16} color="#F59E0B" />
                        <Text style={styles.ratingText}>{data.rating} • {data.distance} away</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('experience_trust')}</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{data.joinedDate}</Text>
                        <Text style={styles.statLabel}>{t('joined')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{data.jobsCompleted}</Text>
                        <Text style={styles.statLabel}>{t('jobs_done')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: Colors.success }]}>98%</Text>
                        <Text style={styles.statLabel}>{t('success_rate')}</Text>
                    </View>
                </View>
            </View>

            {/* Contractor Decisions for Completion */}
            {isContractor && status === 'completion_requested' && (
                <View style={styles.approvalSection}>
                    <Text style={styles.approvalTitle}>{t('completion_requested_label')}</Text>
                    <Text style={styles.approvalSub}>{t('labour_marked_finished')}</Text>
                    <View style={styles.approvalActions}>
                        <AppButton
                            title={t('reject_continue')}
                            type="danger"
                            onPress={() => handleUpdateStatus('active', t('reject_continue'))}
                            style={{ flex: 1 }}
                        />
                        <AppButton
                            title={t('approve_finish')}
                            onPress={() => handleUpdateStatus('completed', t('approve_finish'))}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            )}

            {status === 'completed' && (
                <TouchableOpacity
                    style={styles.rateBtnLarge}
                    onPress={() => navigation.navigate('Rating', { dealId: data.id, ratedUserId: data.id, name: data.name })}
                >
                    <AppIcon name="star" size={20} color={Colors.white} />
                    <Text style={styles.rateBtnText}>{t('rate_worker')}</Text>
                </TouchableOpacity>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('location')}</Text>
                <View style={styles.locationBox}>
                    <AppIcon name="location-outline" size={24} color={Colors.primary} />
                    <View>
                        <Text style={styles.locationMain}>{data.area}, {data.city}</Text>
                        <Text style={styles.locationSub}>Noida, Uttar Pradesh</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsFooter}>
                <AppButton
                    title={t('messages_tab')}
                    onPress={() => navigation.navigate('Chat', { name: data.name, workType: data.skill })}
                    style={styles.mainAction}
                    icon={<AppIcon name="chatbubble-ellipses-outline" size={20} color={Colors.white} />}
                />
                <TouchableOpacity style={styles.callCircle}>
                    <AppIcon name="call-outline" size={24} color={Colors.success} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderJobDetails = () => (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.jobHeader}>
                <View style={[styles.statusBadge, { backgroundColor: status === 'completed' ? Colors.primaryLight : Colors.secondaryLight }]}>
                    <Text style={[styles.statusText, { color: status === 'completed' ? Colors.primary : Colors.secondary }]}>
                        {status === 'active' ? t('in_progress') : status === 'completed' ? t('finished') : t('pending')}
                    </Text>
                </View>
                <Text style={styles.jobTitle}>{data.title}</Text>
                <View style={styles.locationTag}>
                    <AppIcon name="location-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.locationTagText}>{data.area}, {data.city}</Text>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <AppIcon name="timer-outline" size={20} color={Colors.primary} />
                    <Text style={styles.statValueCompact}>{data.duration}</Text>
                    <Text style={styles.statLabel}>{t('work_duration')}</Text>
                </View>
                <View style={styles.statCard}>
                    <AppIcon name="cash-outline" size={20} color={Colors.success} />
                    <Text style={styles.statValueCompact}>{data.payment}</Text>
                    <Text style={styles.statLabel}>{t('approx_payment')}</Text>
                </View>
            </View>

            {/* Labour Action: Finish Work - ONLY if assigned, active, AND from Deals screen */}
            {!isContractor &&
                status === 'active' &&
                data?.assignedLabourId === user?.id &&
                fromDeals && (
                    <View style={styles.labourActionBox}>
                        <Text style={styles.actionTitle}>{t('finish_your_work')}</Text>
                        <AppButton
                            title={t('mark_done')}
                            onPress={() => handleUpdateStatus('completion_requested', t('mark_done'))}
                        />
                    </View>
                )}

            {/* Labour Action: Apply - if not assigned and status is open */}
            {!isContractor && status === 'open' && data?.assignedLabourId !== user?.id && (
                <View style={styles.labourActionBox}>
                    <AppButton
                        title={t('apply')}
                        onPress={() => Alert.alert(t('apply'), t('apply') + '?')}
                    />
                </View>
            )}

            {/* Locked Status for completion_requested */}
            {!isContractor && status === 'completion_requested' && (
                <View style={styles.pendingVerifyBox}>
                    <AppIcon name="timer-outline" size={24} color={Colors.warning} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.pendingTitle}>{t('waiting_for_approval')}</Text>
                        <Text style={styles.pendingSub}>{t('contractor_verifying')}</Text>
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('labour_requirement')}</Text>
                <View style={styles.requirementBox}>
                    <View style={styles.reqRow}>
                        <Text style={styles.reqLabel}>{t('total_required')}</Text>
                        <Text style={styles.reqValue}>{data.labourRequired}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(data.labourAccepted / data.labourRequired) * 100}%` }]} />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('contractor')}</Text>
                <View style={styles.contractorCard}>
                    <View style={styles.contractorAvatar}>
                        <Text style={styles.avatarTextSmall}>{data.contractorName.charAt(0)}</Text>
                    </View>
                    <View style={styles.contractorDetails}>
                        <Text style={styles.contractorName}>{data.contractorName}</Text>
                        <Text style={styles.contractorLoc}>{data.contractorLocation}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.chatMiniBtn}
                        onPress={() => navigation.navigate('Chat', { name: data.contractorName, workType: data.title })}
                    >
                        <AppIcon name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {status === 'completed' && (
                <TouchableOpacity
                    style={styles.rateBtnLarge}
                    onPress={() => navigation.navigate('Rating', {
                        dealId: data.id,
                        ratedUserId: 'mock_contractor_id',
                        name: data.contractorName
                    })}
                >
                    <AppIcon name="star" size={20} color={Colors.white} />
                    <Text style={styles.rateBtnText}>{t('rate_contractor')}</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.appHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('work_details')}</Text>
            </View>
            {itemType === 'labour' ? renderLabourDetails() : renderJobDetails()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: Colors.textSecondary,
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: Colors.white,
    },
    backBtn: {
        padding: 4,
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: spacing.lg,
        borderRadius: 24,
        marginBottom: spacing.l,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    avatarTextLarge: {
        fontSize: 32,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
    },
    headerInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    profileName: {
        fontSize: 20,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    profileSkill: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: typography.weight.semiBold,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    ratingText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    section: {
        marginBottom: spacing.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    statValueCompact: {
        fontSize: 15,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginTop: 6,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    approvalSection: {
        backgroundColor: '#FFFBEB',
        padding: spacing.lg,
        borderRadius: 20,
        marginBottom: spacing.l,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    approvalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#B45309',
        marginBottom: 4,
    },
    approvalSub: {
        fontSize: 13,
        color: '#92400E',
        marginBottom: 16,
    },
    approvalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
    },
    locationMain: {
        fontSize: 15,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
    },
    locationSub: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    jobHeader: {
        backgroundColor: Colors.white,
        padding: spacing.lg,
        borderRadius: 24,
        marginBottom: spacing.l,
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 12,
    },
    statusText: {
        fontWeight: typography.weight.bold,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    locationTagText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    labourActionBox: {
        backgroundColor: Colors.white,
        padding: spacing.lg,
        borderRadius: 20,
        marginBottom: spacing.l,
        alignItems: 'center',
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    pendingVerifyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.l,
        gap: 12,
    },
    pendingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#B45309',
    },
    pendingSub: {
        fontSize: 13,
        color: '#92400E',
    },
    rateBtnLarge: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        backgroundColor: Colors.warning,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    rateBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    requirementBox: {
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
    },
    reqRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    reqLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    reqValue: {
        fontWeight: typography.weight.bold,
        fontSize: 18,
        color: Colors.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: Colors.textInput,
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    contractorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
    },
    contractorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarTextSmall: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
    },
    contractorDetails: {
        flex: 1,
    },
    contractorName: {
        fontSize: 15,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    contractorLoc: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    chatMiniBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: spacing.xl,
    },
    mainAction: {
        flex: 1,
    },
    callCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.secondary,
    }
});

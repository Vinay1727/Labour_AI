import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/common/AppButton';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';

export default function DetailsScreen({ route, navigation }: any) {
    const { role, user } = useAuth();
    const { itemId, itemType, fromDeals } = route.params || {};
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [itemId, itemType]);

    const fetchDetails = async () => {
        if (!itemId) {
            console.warn('DetailsScreen: No itemId provided');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            if (itemType === 'labour') {
                try {
                    const res = await api.get(`users/labour-details/${itemId}`);
                    if (res.data.success) {
                        setData(res.data.data);
                    }
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        setIsNewUser(true);
                        // Synthesize basic data if we can't fetch it
                        setData({
                            _id: itemId,
                            name: route.params?.name || 'New Labour',
                            skills: route.params?.skills || [],
                            role: 'labour',
                            trustSignals: {
                                joinedDate: 'Recent',
                                jobsCompleted: 0
                            }
                        });
                    } else {
                        console.error('Fetch Details Error:', err);
                    }
                }
            } else {
                const endpoint = fromDeals ? `deals/${itemId}` : `jobs/${itemId}`;
                const res = await api.get(endpoint);
                if (res.data.success) {
                    const item = res.data.data;
                    if (fromDeals) {
                        setData({
                            id: item._id,
                            title: item.jobId?.workType || 'Job Details',
                            status: item.status,
                            location: item.jobId?.location || { address: 'Location' },
                            duration: 'Ongoing',
                            payment: item.jobId?.paymentAmount ? `₹${item.jobId.paymentAmount}` : 'N/A',
                            labourId: item.labourId?._id || item.labourId,
                            contractorId: item.contractorId?._id || item.contractorId,
                            contractorName: item.contractorId?.name || 'Contractor',
                            contractorPhone: item.contractorId?.phone,
                            labourName: item.labourId?.name || 'Labour',
                            labourPhone: item.labourId?.phone,
                            labourFinishRequested: item.labourFinishRequested
                        });
                    } else {
                        setData({
                            id: item._id,
                            title: item.workType,
                            status: item.status,
                            location: item.location,
                            duration: 'Flexible',
                            payment: `₹${item.paymentAmount} (${item.paymentType})`,
                            labourRequired: item.requiredWorkers,
                            labourAccepted: item.filledWorkers,
                            contractorName: item.contractorId?.name || 'Contractor',
                            contractorLocation: item.contractorId?.location?.area || 'Nearby',
                            contractorPhone: item.contractorId?.phone,
                            applications: item.applications || []
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Fetch Details Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>{t('loading_details')}</Text>
            </View>
        );
    }

    const renderLabourDetails = () => {
        const trust = data.trustSignals || null;
        const isNewUserLocal = isNewUser || !trust || (trust.jobsCompleted || 0) === 0;

        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{data.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.profileName}>{data.name}</Text>
                            <AppIcon name="shield-checkmark" size={20} color={Colors.primary} />
                        </View>

                        {isNewUserLocal ? (
                            <View style={[styles.rankBadge, { backgroundColor: '#DBEAFE' }]}>
                                <AppIcon name="sparkles-outline" size={12} color={Colors.primary} />
                                <Text style={[styles.rankText, { color: Colors.primary }]}>New Labour / Fresher</Text>
                            </View>
                        ) : data.rank && (
                            <View style={[styles.rankBadge, {
                                backgroundColor: data.rank === 'Top Labour' ? '#FEF3C7' :
                                    data.rank === 'Trusted' ? '#DCFCE7' : '#F1F5F9'
                            }]}>
                                <AppIcon name="ribbon-outline" size={12} color={data.rank === 'Top Labour' ? '#D97706' : '#059669'} />
                                <Text style={[styles.rankText, {
                                    color: data.rank === 'Top Labour' ? '#D97706' :
                                        data.rank === 'Trusted' ? '#059669' : Colors.textSecondary
                                }]}>{data.rank}</Text>
                            </View>
                        )}

                        <Text style={styles.profileSkill}>{(data.skills || []).join(', ')}</Text>
                        <View style={styles.ratingRow}>
                            <AppIcon name="star" size={16} color="#F59E0B" />
                            <Text style={styles.ratingText}>
                                {isNewUserLocal ? 'New User' : `${data.averageRating || '4.0'} • ${trust?.jobsCompleted || 0} work done`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. Trust & Experience Cards */}
                <View style={styles.section}>
                    <View style={styles.trustGrid}>
                        <View style={styles.trustCard}>
                            <Text style={styles.trustValue}>{trust?.joinedDate || 'Recent'}</Text>
                            <Text style={styles.trustLabel}>Joined</Text>
                        </View>
                        {!isNewUserLocal && (
                            <>
                                <View style={styles.trustCard}>
                                    <Text style={[styles.trustValue, { color: Colors.success }]}>{trust?.reliabilityScore}%</Text>
                                    <Text style={styles.trustLabel}>Reliability</Text>
                                </View>
                                <View style={styles.trustCard}>
                                    <Text style={styles.trustValue}>{trust?.repeatHireRate}%</Text>
                                    <Text style={styles.trustLabel}>Repeat Hire</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* New User Message */}
                {isNewUserLocal && (
                    <View style={styles.newUserInfoCard}>
                        <AppIcon name="information-circle-outline" size={20} color={Colors.primary} />
                        <Text style={styles.newUserInfoText}>
                            Trust score and attendance data will be available after first work completion.
                        </Text>
                    </View>
                )}

                {/* 3. Behaviour Tags */}
                {!isNewUserLocal && trust?.behaviourTags?.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.tagContainer}>
                            {trust.behaviourTags.map((tag: string, i: number) => (
                                <View key={i} style={styles.behaviourTag}>
                                    <AppIcon name="checkmark-circle" size={14} color={Colors.success} />
                                    <Text style={styles.behaviourTagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 4. Skill Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skill Experience</Text>
                    <View style={styles.whiteCard}>
                        {trust?.skillExperience?.length > 0 ? trust.skillExperience.map((item: any, i: number) => (
                            <View key={i} style={styles.skillRow}>
                                <Text style={styles.skillName}>{item._id}</Text>
                                <Text style={styles.skillCount}>{item.count} jobs</Text>
                            </View>
                        )) : (
                            <Text style={styles.emptyInfo}>{isNewUser ? 'Verified Skills: ' + (data.skills || []).join(', ') : 'No completed jobs yet'}</Text>
                        )}
                    </View>
                </View>

                {/* 5. Area Familiarity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Area Familiarity</Text>
                    <View style={styles.areaContainer}>
                        {trust?.areaFamiliarity?.length > 0 ? trust.areaFamiliarity.map((area: string, i: number) => (
                            <View key={i} style={styles.areaChip}>
                                <AppIcon name="navigate-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.areaChipText}>{area}</Text>
                            </View>
                        )) : (
                            <Text style={styles.emptyInfo}>Verified in current area</Text>
                        )}
                    </View>
                </View>

                {/* 6. Attendance Summary (Only for existing users) */}
                {!isNewUserLocal && (
                    <View style={styles.section}>
                        <View style={styles.attendanceBox}>
                            <View style={styles.attendanceLeft}>
                                <Text style={styles.attendanceTitle}>Attendance Summary</Text>
                                <Text style={styles.attendanceSubText}>Based on last 30 days site logs</Text>
                            </View>
                            <View style={styles.attendanceCircle}>
                                <Text style={styles.attendanceValue}>{trust?.attendanceScore}%</Text>
                                <Text style={styles.attendanceLabel}>on time</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 7. Review Summary */}
                {!isNewUserLocal && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Reviews</Text>
                        {trust?.recentReviews?.length > 0 ? trust.recentReviews.map((rev: any, i: number) => (
                            <View key={i} style={styles.reviewMiniCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{rev.reviewer}</Text>
                                    <View style={styles.miniRating}>
                                        <AppIcon name="star" size={12} color="#F59E0B" />
                                        <Text style={styles.miniRatingText}>{rev.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.reviewComment} numberOfLines={2}>"{rev.comment || 'Good work'}"</Text>
                            </View>
                        )) : (
                            <View style={styles.whiteCard}>
                                <Text style={styles.emptyInfo}>No reviews yet</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 8. Verification Badge Explainer */}
                <View style={styles.verificationNote}>
                    <AppIcon name="shield-checkmark" size={18} color={Colors.primary} />
                    <Text style={styles.verificationNoteText}>Phone, Site Attendance, and Work History verified by Bharat Chowk.</Text>
                </View>

                {/* 9. Actions */}
                <View style={styles.actionsFooter}>
                    <AppButton
                        title="Message"
                        onPress={() => navigation.navigate('Chat', { dealId: 'new', name: data.name, workType: data.skills?.[0] })}
                        style={styles.mainAction}
                        icon={<AppIcon name="chatbubble-ellipses-outline" size={20} color={Colors.white} />}
                    />
                    {role === 'contractor' && (
                        <TouchableOpacity
                            style={styles.callCircle}
                            onPress={() => Linking.openURL(`tel:${data.phone}`)}
                        >
                            <AppIcon name="call-outline" size={24} color={Colors.success} />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        );
    };

    const renderJobDetails = () => {
        const isApplied = data.applications?.some((app: any) => app.labourId === user?.id || app.labourId?._id === user?.id);
        return (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.jobHeader}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{data.status}</Text>
                    </View>
                    <Text style={styles.jobTitle}>{data.title}</Text>
                    <View style={styles.locationTag}>
                        <AppIcon name="location-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.locationTagText}>{data.location?.address || 'Site Location'}</Text>
                    </View>
                </View>

                <View style={styles.trustGrid}>
                    <View style={styles.trustCard}>
                        <AppIcon name="timer-outline" size={20} color={Colors.primary} />
                        <Text style={styles.trustValueSmall}>{data.duration}</Text>
                        <Text style={styles.trustLabel}>Duration</Text>
                    </View>
                    <View style={styles.trustCard}>
                        <AppIcon name="cash-outline" size={20} color={Colors.success} />
                        <Text style={styles.trustValueSmall}>{data.payment}</Text>
                        <Text style={styles.trustLabel}>Payment</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Labour Required</Text>
                    <View style={styles.whiteCard}>
                        <Text style={styles.reqValue}>{data.labourAccepted || 0} / {data.labourRequired || 0} Workers joined</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contractor</Text>
                    <View style={styles.whiteCard}>
                        <View style={styles.row}>
                            <View style={styles.avatarSmall}>
                                <Text style={styles.avatarTextSmall}>{data.contractorName?.charAt(0)}</Text>
                            </View>
                            <View style={styles.flex}>
                                <Text style={styles.nameSmall}>{data.contractorName}</Text>
                                <Text style={styles.locSmall}>{data.contractorLocation}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {!isApplied && !fromDeals && role === 'labour' && (
                    <AppButton
                        title="Kaam ke liye apply karein"
                        onPress={() => Alert.alert('Apply', 'Application sent')}
                        style={{ marginTop: 20 }}
                    />
                )}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.appHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{itemType === 'labour' ? 'Labour Profile' : 'Kaam ki Detail'}</Text>
            </View>
            {!data ? (
                <View style={styles.loadingContainer}>
                    <Text>Details not found</Text>
                </View>
            ) : (
                itemType === 'labour' ? renderLabourDetails() : renderJobDetails()
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.textSecondary },
    appHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    backBtn: { padding: 4, marginRight: spacing.sm },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: spacing.md, paddingBottom: 40 },
    profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: spacing.lg, borderRadius: 20, marginBottom: spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
    avatarTextLarge: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
    headerInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    profileName: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
    rankBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4, gap: 4 },
    rankText: { fontSize: 11, fontWeight: 'bold' },
    profileSkill: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: spacing.sm },
    trustGrid: { flexDirection: 'row', gap: spacing.sm },
    trustCard: { flex: 1, backgroundColor: Colors.white, padding: spacing.md, borderRadius: 16, alignItems: 'center', elevation: 1 },
    trustValue: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
    trustValueSmall: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 4 },
    trustLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, textTransform: 'uppercase' },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    behaviourTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    behaviourTagText: { fontSize: 12, color: '#065F46', fontWeight: '600' },
    whiteCard: { backgroundColor: Colors.white, padding: spacing.md, borderRadius: 16, elevation: 1 },
    skillRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    skillName: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
    skillCount: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
    areaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    areaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    areaChipText: { fontSize: 12, color: Colors.textPrimary },
    attendanceBox: { flexDirection: 'row', backgroundColor: Colors.primary, padding: spacing.lg, borderRadius: 20, alignItems: 'center' },
    attendanceLeft: { flex: 1 },
    attendanceTitle: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
    attendanceSubText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
    attendanceCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
    attendanceValue: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
    attendanceLabel: { color: Colors.white, fontSize: 8 },
    reviewMiniCard: { backgroundColor: Colors.white, padding: spacing.md, borderRadius: 16, marginBottom: 8, elevation: 1 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    reviewerName: { fontSize: 13, fontWeight: 'bold', color: Colors.textPrimary },
    miniRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    miniRatingText: { fontSize: 11, fontWeight: 'bold', color: '#B45309' },
    reviewComment: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
    verificationNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 20 },
    verificationNoteText: { fontSize: 11, color: Colors.primary, flex: 1, fontWeight: '500' },
    actionsFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mainAction: { flex: 1 },
    callCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.success },
    emptyInfo: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
    newUserInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F0F9FF',
        padding: 16,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    newUserInfoText: {
        fontSize: 13,
        color: '#0369A1',
        flex: 1,
        fontWeight: '500',
        lineHeight: 18,
    },
    jobHeader: { backgroundColor: Colors.white, padding: spacing.lg, borderRadius: 20, marginBottom: spacing.md, alignItems: 'center' },
    statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
    statusText: { fontSize: 10, color: '#B45309', fontWeight: 'bold', textTransform: 'uppercase' },
    jobTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    locationTagText: { fontSize: 13, color: Colors.textSecondary },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    flex: { flex: 1 },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
    avatarTextSmall: { color: Colors.primary, fontWeight: 'bold' },
    nameSmall: { fontSize: 14, fontWeight: 'bold' },
    locSmall: { fontSize: 11, color: Colors.textSecondary },
    reqValue: { fontSize: 15, fontWeight: '600', color: Colors.primary, textAlign: 'center' },
});

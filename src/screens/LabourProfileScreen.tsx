import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import { AppButton } from '../components/common/AppButton';

export default function LabourProfileScreen({ route, navigation }: any) {
    const { labourId: rawId, name: initialName } = route.params;
    const labourId = typeof rawId === 'object' ? rawId._id : rawId;
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [labourId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get(`users/labour-details/${labourId}`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                setIsNewUser(true);
                // Basic info if not found in trust system
                setData({
                    name: initialName || 'Labour',
                    skills: [],
                    trustSignals: {
                        joinedDate: 'Recent',
                        jobsCompleted: 0
                    }
                });
            } else {
                console.error('Fetch Profile Error:', err);
                Alert.alert('Error', 'Failed to load profile');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const trust = data?.trustSignals || null;
    const isNewUserLocal = isNewUser || !trust || (trust.jobsCompleted || 0) === 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Labour Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{(data?.name || 'L').charAt(0)}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.profileName}>{data?.name}</Text>
                            <AppIcon name="shield-checkmark" size={20} color={Colors.primary} />
                        </View>

                        {isNewUserLocal ? (
                            <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
                                <AppIcon name="sparkles-outline" size={12} color={Colors.primary} />
                                <Text style={[styles.badgeText, { color: Colors.primary }]}>New Labour / Fresher</Text>
                            </View>
                        ) : data?.rank && (
                            <View style={[styles.badge, {
                                backgroundColor: data.rank === 'Top Labour' ? '#FEF3C7' :
                                    data.rank === 'Trusted' ? '#DCFCE7' : '#F1F5F9'
                            }]}>
                                <AppIcon name="ribbon-outline" size={12} color={data.rank === 'Top Labour' ? '#D97706' : '#059669'} />
                                <Text style={[styles.badgeText, {
                                    color: data.rank === 'Top Labour' ? '#D97706' :
                                        data.rank === 'Trusted' ? '#059669' : Colors.textSecondary
                                }]}>{data.rank}</Text>
                            </View>
                        )}

                        <Text style={styles.profileSkill}>{(data?.skills || []).join(', ') || 'General Worker'}</Text>
                        <View style={styles.ratingRow}>
                            <AppIcon name="star" size={16} color="#F59E0B" />
                            <Text style={styles.ratingText}>
                                {isNewUserLocal ? 'New User' : `${data?.averageRating || '4.0'} • ${trust?.jobsCompleted || 0} work done`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. Trust Badges Summary */}
                <View style={styles.badgesRow}>
                    {isNewUserLocal && (
                        <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                            <AppIcon name="leaf" size={14} color="#059669" />
                            <Text style={[styles.statusBadgeText, { color: '#059669' }]}>New Member</Text>
                        </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF' }]}>
                        <AppIcon name="shield-checkmark" size={14} color="#2563EB" />
                        <Text style={[styles.statusBadgeText, { color: '#2563EB' }]}>Phone Verified</Text>
                    </View>
                    {!isNewUserLocal && (
                        <View style={[styles.statusBadge, { backgroundColor: '#FFFBEB' }]}>
                            <AppIcon name="timer" size={14} color="#D97706" />
                            <Text style={[styles.statusBadgeText, { color: '#D97706' }]}>On-Time</Text>
                        </View>
                    )}
                </View>

                {/* 3. Stats Section */}
                {!isNewUserLocal && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Performance Stats</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{trust?.reliabilityScore}%</Text>
                                <Text style={styles.statLabel}>Reliability</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{trust?.attendanceScore}%</Text>
                                <Text style={styles.statLabel}>Attendance</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{trust?.repeatHireRate}%</Text>
                                <Text style={styles.statLabel}>Repeat Hire</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* New User Placeholder */}
                {isNewUserLocal && (
                    <View style={styles.infoBox}>
                        <AppIcon name="information-circle-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoBoxText}>
                            Performance metrics and detailed work history will be visible after this labourer completes their first session.
                        </Text>
                    </View>
                )}

                {/* 4. Experience & Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    <View style={styles.whiteCard}>
                        {trust?.skillExperience?.length > 0 ? trust.skillExperience.map((item: any, i: number) => (
                            <View key={i} style={styles.skillRow}>
                                <Text style={styles.skillName}>{item._id}</Text>
                                <Text style={styles.skillCount}>{item.count} jobs done</Text>
                            </View>
                        )) : (
                            <Text style={styles.emptyText}>New to Bharat Chowk</Text>
                        )}
                    </View>
                </View>

                {/* 5. Recent Reviews */}
                {!isNewUserLocal && trust?.recentReviews?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Feedback</Text>
                        {trust.recentReviews.map((rev: any, i: number) => (
                            <View key={i} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{rev.reviewer}</Text>
                                    <View style={styles.miniRating}>
                                        <AppIcon name="star" size={12} color="#F59E0B" />
                                        <Text style={styles.miniRatingText}>{rev.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>"{rev.comment || 'N/A'}"</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.footerSpacing} />
            </ScrollView>

            <View style={styles.actions}>
                <AppButton
                    title="Call Labour"
                    onPress={() => Linking.openURL(`tel:${data?.phone}`)}
                    style={styles.callBtn}
                    icon={<AppIcon name="call" size={20} color={Colors.white} />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: {
        padding: 4,
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: spacing.lg,
        borderRadius: 20,
        marginBottom: spacing.md,
        elevation: 2,
    },
    avatarLarge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    avatarTextLarge: {
        fontSize: 28,
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        gap: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    profileSkill: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    ratingText: {
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: spacing.lg,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: spacing.sm,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    whiteCard: {
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
        elevation: 1,
    },
    skillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    skillName: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    skillCount: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '600',
    },
    infoBox: {
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
    infoBoxText: {
        fontSize: 13,
        color: '#0369A1',
        flex: 1,
        fontWeight: '500',
        lineHeight: 18,
    },
    reviewCard: {
        backgroundColor: Colors.white,
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: 8,
        elevation: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reviewerName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    miniRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    miniRatingText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#B45309',
    },
    reviewComment: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontStyle: 'italic',
    },
    actions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    callBtn: {
        backgroundColor: Colors.success,
    },
    emptyText: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    footerSpacing: {
        height: 60,
    }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { InfoCard } from '../components/profile/InfoCard';
import { ProfileRow } from '../components/profile/ProfileRow';
import { WorkHistory } from '../components/profile/WorkHistory';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';

export default function ProfileScreen() {
    const { role, logout, user } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    // User Data from Auth or Mock
    const formatLocation = (loc: any) => {
        if (!loc) return 'Noida, Sector 62';
        if (typeof loc === 'string') return loc;
        return `${loc.area || 'Noida'}, ${loc.city || 'Sector 62'}`;
    };

    const userData = {
        name: user?.name || 'Vinay Badnoriya',
        role: role || 'labour',
        location: formatLocation(user?.location),
        phone: user?.phone || '+91 9876543210',
        skill: user?.skill || 'Painter / पेंटर',
        experience: user?.experience || '5',
        rating: '4.8',
        isVerified: true,
        jobsPosted: 12,
        activeJobs: 3,
    };

    const isContractor = userData.role === 'contractor';

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* Visual Header with Verified Badge */}
                <ProfileHeader
                    name={userData.name}
                    role={userData.role as any}
                    location={userData.location}
                />

                <View style={styles.content}>

                    {/* Part 2: High-Visibility Verified Badge */}
                    {userData.isVerified && (
                        <View style={styles.verifiedBadgeContainer}>
                            <View style={styles.verifiedBadge}>
                                <AppIcon name="shield-checkmark" size={18} color={Colors.white} />
                                <Text style={styles.verifiedText}>{t('verified_profile')}</Text>
                            </View>
                        </View>
                    )}

                    {/* Quick Info Grid */}
                    <View style={styles.grid}>
                        {isContractor ? (
                            <>
                                <InfoCard icon="briefcase" label={t('jobs_posted')} value={userData.jobsPosted.toString()} />
                                <InfoCard icon="flash" label={t('active_jobs')} value={userData.activeJobs.toString()} />
                                <InfoCard icon="star" label={t('rating')} value={`${userData.rating} ⭐`} />
                                <InfoCard icon="location" label={t('service_area')} value="Noida" />
                            </>
                        ) : (
                            <>
                                <InfoCard icon="hammer" label={t('skill')} value={userData.skill} />
                                <InfoCard icon="time" label={t('exp_years')} value={`${userData.experience}y`} />
                                <InfoCard icon="wallet" label={t('work_mode')} value="Daily" />
                                <InfoCard icon="star" label={t('rating')} value={`${userData.rating} ⭐`} />
                            </>
                        )}
                    </View>

                    {/* Action Section */}
                    <View style={styles.actionSection}>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <AppIcon name="create-outline" size={20} color={Colors.white} />
                                <Text style={styles.editBtnText}>{t('edit_profile')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.settingsBtn}
                                onPress={() => navigation.navigate('Settings')}
                            >
                                <AppIcon name="settings-outline" size={22} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingsCard}>
                            <ProfileRow icon="call-outline" label={t('phone')} value={userData.phone} />
                            <View style={styles.divider} />
                            <ProfileRow icon="map-outline" label={t('location')} value={userData.location} />
                        </View>
                    </View>

                    {/* Part 3 & 4: Role-Based Work History */}
                    <WorkHistory role={userData.role as any} userId="123" />

                    {/* Bottom Actions */}
                    {/* Bottom Info */}
                    <View style={styles.bottomInfo}>
                        <Text style={styles.versionText}>Labour Chowk v1.2.0 (Stable)</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: spacing.l,
        marginTop: -30,
    },
    verifiedBadgeContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
        zIndex: 10,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    verifiedText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 13,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    actionSection: {
        marginBottom: spacing.xl,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: spacing.md,
    },
    editBtn: {
        flex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 10,
        elevation: 2,
    },
    editBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    settingsBtn: {
        width: 56,
        height: 56,
        backgroundColor: Colors.white,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
    },
    settingsCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: spacing.m,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: spacing.m,
    },
    bottomInfo: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 20,
    },
    versionText: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 10,
    }
});

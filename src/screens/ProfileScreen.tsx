import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { role, logout, user } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    const isContractor = role === 'contractor';

    // Helper: Format Location
    const formatLocation = (loc: any) => {
        if (!loc) return t('location_not_set' as any) || 'Location not set';
        if (typeof loc === 'string') return loc;
        return `${loc.area || ''}, ${loc.city || ''}`.replace(/^, /, '');
    };

    // Derived User Data (Safe Handling)
    const userData = {
        name: user?.name || t('guest_user' as any),
        initials: (user?.name || 'U').charAt(0).toUpperCase(),
        roleLabel: isContractor ? t('contractor') : t('labour'),
        location: formatLocation(user?.location),
        phone: user?.phone || '',
        skill: user?.skills?.[0] || (user?.isSkilled ? t('skilled_worker' as any) : t('helper_worker' as any)),
        experience: user?.experience || '0',
        rating: 4.8, // Mock or Real
        jobsCompleted: 12, // Mock or Real
        isVerified: true,
        // user.experience might be string from API
        isNewUser: (String(user?.experience || '0') === '0' || !user?.experience),
    };

    // UI Components for Grid
    const ActionItem = ({ icon, label, onPress, color = Colors.primary, bgColor = '#EFF6FF' }: any) => (
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.white }]}>
                <AppIcon name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.actionLabel, { color: color === Colors.error ? Colors.error : Colors.textPrimary }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const StatBox = ({ label, value, icon, color }: any) => (
        <View style={styles.statBox}>
            <AppIcon name={icon} size={20} color={color} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const Badge = ({ label, icon, color, bg }: any) => (
        <View style={[styles.badgeContainer, { backgroundColor: bg || '#F3F4F6' }]}>
            <AppIcon name={icon} size={14} color={color} />
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* HER BACKGROUND + STATS (FIXED) */}
            <View>
                <View style={[styles.heroBackground, { backgroundColor: isContractor ? '#1E40AF' : '#047857' }]}>
                    <SafeAreaView edges={['top']} style={styles.headerSafe}>
                        <View style={styles.headerTop}>
                            <Text style={styles.headerTitle}>{t('my_profile' as any)}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                                <AppIcon name="settings-outline" size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* HERO PROFILE INFO */}
                    <View style={styles.heroProfile}>
                        <View style={styles.avatarContainer}>
                            <Text style={[styles.avatarText, { color: isContractor ? '#1E40AF' : '#047857' }]}>
                                {userData.initials}
                            </Text>
                            {userData.isVerified && (
                                <View style={styles.verifiedCheck}>
                                    <AppIcon name="checkmark" size={12} color={Colors.white} />
                                </View>
                            )}
                        </View>
                        <View style={styles.heroText}>
                            <Text style={styles.heroName}>{userData.name}</Text>
                            <Text style={styles.heroSubtitle}>
                                {userData.skill} • {userData.location}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* VISIBLE STATS CARD (FIXED) */}
                <View style={styles.fixedStatsContainer}>
                    <View style={styles.statsCard}>
                        <StatBox
                            icon="star"
                            color="#F59E0B"
                            value={userData.isNewUser ? t('new_badge' as any) : userData.rating}
                            label={t('rating')}
                        />
                        <View style={styles.statDivider} />
                        <StatBox
                            icon="briefcase"
                            color={isContractor ? '#3B82F6' : '#10B981'}
                            value={userData.jobsCompleted || 0}
                            label={t('jobs_done' as any)}
                        />
                        <View style={styles.statDivider} />
                        <StatBox
                            icon="time"
                            color="#8B5CF6"
                            value={`${userData.experience}y`}
                            label={t('exp_years')}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* BADGES SECTION */}
                <View style={styles.badgesGrid}>
                    {userData.isNewUser && (
                        <Badge label={t('new_member' as any)} icon="leaf" color="#10B981" bg="#ECFDF5" />
                    )}
                    {userData.isVerified && (
                        <Badge label={t('phone_verified' as any)} icon="shield-checkmark" color="#3B82F6" bg="#EFF6FF" />
                    )}
                    <Badge label={t('on_time_worker' as any)} icon="timer" color="#F59E0B" bg="#FFFBEB" />
                    <Badge label={t('trusted' as any)} icon="ribbon" color="#8B5CF6" bg="#F5F3FF" />
                </View>

                {/* BASIC INFO SECTION */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>{t('contact_info' as any)}</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <AppIcon name="call-outline" size={20} color={Colors.textSecondary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>{t('phone')}</Text>
                            <Text style={styles.infoValue}>{userData.phone}</Text>
                        </View>
                        {userData.isVerified && <AppIcon name="checkmark-circle" size={18} color={Colors.success} />}
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.infoIcon}>
                            <AppIcon name="location-outline" size={20} color={Colors.textSecondary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>{t('location')}</Text>
                            <Text style={styles.infoValue}>{userData.location}</Text>
                        </View>
                    </View>
                </View>

                {/* ACTION GRID */}
                <Text style={styles.sectionHeader}>{t('account_settings' as any)}</Text>
                <View style={styles.gridContainer}>
                    <ActionItem
                        label={t('edit_profile')}
                        icon="create-outline"
                        color={Colors.primary}
                        bgColor="#EFF6FF"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <ActionItem
                        label={t('help_support')}
                        icon="help-circle-outline"
                        color={Colors.info}
                        bgColor="#F0F9FF"
                        onPress={() => navigation.navigate('Help')}
                    />
                </View>
                <View style={styles.gridContainer}>
                    <ActionItem
                        label={t('privacy_policy')}
                        icon="shield-outline"
                        color="#64748B"
                        bgColor="#F8FAFC"
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    />
                    <ActionItem
                        label={t('logout')}
                        icon="log-out-outline"
                        color={Colors.error}
                        bgColor="#FEF2F2"
                        onPress={logout}
                    />
                </View>

                {/* App Version Footer */}
                <Text style={styles.versionText}>App Version v1.0.2</Text>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    heroBackground: {
        height: 240,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        zIndex: 1,
    },
    headerSafe: {
        marginBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.s,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    heroProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
        position: 'relative',
        elevation: 5,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    verifiedCheck: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.success,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    heroText: {
        flex: 1,
    },
    heroName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    fixedStatsContainer: {
        position: 'absolute',
        top: 180,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.l,
        zIndex: 10,
    },
    contentScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.l,
        paddingBottom: 20,
        paddingTop: 60, // Reduced from 80 to tighten gap between Stats and Badges
    },
    statsCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Colors.border,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.l,
        marginBottom: 16, // Reduced from spacing.l (24)
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        width: '48%',
        marginBottom: 12,
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        flex: 1,
    },
    sectionContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.m,
        marginBottom: 16, // Reduced from spacing.l (24)
        elevation: 1,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 8, // Reduced from spacing.m (16)
        marginLeft: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 20,
    },
    actionCard: {
        flex: 1, // Professional flexible width
        padding: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    actionIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8, // Reduced from 12
    },
    actionLabel: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 12, // Reduced from 20
    }
});

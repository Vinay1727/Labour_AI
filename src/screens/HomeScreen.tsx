import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { role, user } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [availableJobs, setAvailableJobs] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const isFocused = useIsFocused();

    React.useEffect(() => {
        if (isFocused) {
            fetchJobs();
            fetchUnreadCount();
        }
    }, [isFocused, role]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('notifications');
            if (res.data.success) {
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Fetch Unread Count Error:', err);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await api.get('jobs');
            if (res.data.success) {
                setAvailableJobs(res.data.data);
            }
        } catch (err) {
            console.error('Fetch Jobs Error:', err);
        }
    };

    const handleApply = async (jobId: string) => {
        try {
            const res = await api.post(`jobs/${jobId}/apply`);
            if (res.data.success) {
                Alert.alert(t('success'), t('application_submitted'));
                fetchJobs();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to apply');
        }
    };

    const renderContractorView = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={[styles.headerSection, { backgroundColor: Colors.headerBlue }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>{t('hello')} 👋</Text>
                    <Text style={styles.subGreeting}>{t('find_labour_near')}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Notification')}
                    style={styles.notifBtn}
                >
                    <AppIcon name="notifications-outline" size={26} color={Colors.textPrimary} />
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            {/* Primary Action Card */}
            <TouchableOpacity
                style={styles.primaryActionCard}
                onPress={() => navigation.navigate('PostNewWork')}
            >
                <View style={styles.iconCircle}>
                    <Text style={styles.bigIcon}>🏗️</Text>
                </View>
                <View style={styles.primaryCardText}>
                    <Text style={styles.primaryActionTitle}>{t('post_new_work')}</Text>
                    <Text style={styles.primaryActionSub}>{t('find_labour_near')}</Text>
                </View>
                <AppIcon name="add-circle" size={32} color={Colors.white} />
            </TouchableOpacity>

            {/* Active Requests Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('your_posted_jobs')}</Text>
                {availableJobs.map((item, index) => (
                    <TouchableOpacity
                        key={item._id || index.toString()}
                        style={styles.requestCard}
                        onPress={() => navigation.navigate('JobApplications', { jobId: item._id })}
                    >
                        <View style={styles.requestInfo}>
                            <Text style={styles.workType}>{item.workType}</Text>
                            <View style={styles.locationRow}>
                                <AppIcon name="location-outline" size={14} color={Colors.textLight} />
                                <Text style={styles.locationText}>{item.location?.address || 'Location'}</Text>
                            </View>
                            <Text style={styles.appliedCountText}>
                                {item.filledWorkers} / {item.requiredWorkers} Workers • {item.applications?.length || 0} Applied
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, {
                            backgroundColor: item.status === 'open' ? '#FEF3C7' :
                                item.status === 'in_progress' ? '#DBEAFE' :
                                    item.status === 'completed' ? '#D1FAE5' : '#F3F4F6'
                        }]}>
                            <Text style={[styles.statusText, {
                                color: item.status === 'open' ? '#B45309' :
                                    item.status === 'in_progress' ? Colors.primary :
                                        item.status === 'completed' ? '#059669' : Colors.textSecondary
                            }]}>
                                {item.status === 'completed' ? t('finished').toUpperCase() :
                                    item.status === 'in_progress' ? t('in_progress').toUpperCase() :
                                        item.status.toUpperCase()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {availableJobs.length === 0 && (
                    <View style={styles.emptySmall}>
                        <Text style={styles.emptyText}>{t('no_jobs_posted')}</Text>
                    </View>
                )}
            </View>

            <View style={styles.tipCard}>
                <AppIcon name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.tipText}>Only nearby labour will see your request</Text>
            </View>
        </ScrollView>
    );

    const renderLabourView = () => (
        <View style={styles.scrollView}>
            <View style={[styles.headerSection, { backgroundColor: Colors.headerGreen }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>{t('nearby_work_for_you')}</Text>
                    <View style={styles.locationIndicator}>
                        <AppIcon name="location-outline" size={16} color={Colors.primary} />
                        <Text style={styles.locationLabel}>Gurgaon, Haryana</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Notification')}
                    style={styles.notifBtn}
                >
                    <AppIcon name="notifications-outline" size={26} color={Colors.textPrimary} />
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            <FlatList
                data={availableJobs}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: spacing.layout.containerPaddding }}
                ListHeaderComponent={<Text style={styles.sectionTitle}>{t('available_jobs')}</Text>}
                renderItem={({ item }) => {
                    const myApplication = item.applications?.find((app: any) => app.labourId === user?.id || app.labourId?._id === user?.id);
                    const isApplied = !!myApplication;

                    return (
                        <TouchableOpacity
                            style={styles.jobCard}
                            onPress={() => navigation.navigate('Details', { itemId: item._id, itemType: 'job' })}
                        >
                            <View style={styles.jobHeader}>
                                <View>
                                    <Text style={styles.jobRoleTitle}>{item.workType}</Text>
                                    <Text style={styles.jobDistance}>
                                        {item.location?.area ? `${item.location.area}, ${item.location.city}` : (item.location?.address || 'Location N/A')}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.jobPrice}>₹{item.paymentAmount}</Text>
                                    {isApplied && (
                                        <View style={[styles.statusBadge, {
                                            backgroundColor: myApplication.status === 'pending' ? '#FEF3C7' : myApplication.status === 'approved' ? '#D1FAE5' : '#FEE2E2',
                                            marginTop: 4
                                        }]}>
                                            <Text style={[styles.statusText, {
                                                color: myApplication.status === 'pending' ? '#B45309' : myApplication.status === 'approved' ? '#059669' : '#DC2626'
                                            }]}>
                                                {myApplication.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.jobActions}>
                                <TouchableOpacity style={styles.ignoreButton}>
                                    <Text style={styles.ignoreButtonText}>{t('ignore')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.acceptButton, isApplied && { backgroundColor: Colors.border }]}
                                    onPress={() => !isApplied && handleApply(item._id)}
                                    disabled={isApplied}
                                >
                                    <Text style={[styles.acceptButtonText, isApplied && { color: Colors.textSecondary }]}>
                                        {isApplied ? t('pending_approval') : t('apply')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AppIcon name="search-outline" size={60} color={Colors.border} />
                        <Text style={styles.emptyText}>{t('no_work_nearby')}</Text>
                    </View>
                }
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {role === 'contractor' ? renderContractorView() : renderLabourView()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    headerContent: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    subGreeting: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    locationIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    locationLabel: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    onlineText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.success,
        marginRight: 6,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success,
    },
    primaryActionCard: {
        backgroundColor: Colors.primary,
        marginHorizontal: spacing.md,
        borderRadius: 20,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        marginBottom: spacing.xl,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bigIcon: {
        fontSize: 30,
    },
    primaryCardText: {
        flex: 1,
    },
    primaryActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    primaryActionSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.size.sectionTitle,
        fontWeight: typography.weight.bold as any,
        color: Colors.textPrimary,
        marginBottom: spacing.md,
    },
    requestCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    requestInfo: {
        flex: 1,
    },
    workType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
    },
    tipText: {
        fontSize: 13,
        color: Colors.primary,
        marginLeft: 10,
        flex: 1,
    },
    jobCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    jobRoleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    jobDistance: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    jobPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.success,
    },
    jobActions: {
        flexDirection: 'row',
        gap: 12,
    },
    ignoreButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    ignoreButtonText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: Colors.white,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 16,
    },
    appliedCountText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
        marginTop: 4,
    },
    emptySmall: {
        padding: 20,
        alignItems: 'center',
    },
    notifBtn: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: Colors.error,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

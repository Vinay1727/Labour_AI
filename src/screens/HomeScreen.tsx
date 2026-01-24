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
import { DeleteReasonModal } from '../components/common/DeleteReasonModal';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { role, user } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [availableJobs, setAvailableJobs] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);

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

    const handleDeleteJob = async (reason: string) => {
        if (!selectedJobId) return;
        try {
            setIsDeleting(true);
            const res = await api.delete(`jobs/${selectedJobId}`, { data: { reason } });
            if (res.data.success) {
                Alert.alert('Success', 'Job deleted successfully');
                setShowDeleteModal(false);
                fetchJobs();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
        } finally {
            setIsDeleting(false);
            setSelectedJobId(null);
        }
    };

    const handleEditJob = (job: any) => {
        navigation.navigate('PostNewWork', { jobData: job });
    };

    const renderContractorView = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={[styles.headerSection, { backgroundColor: '#F8FAFC' }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>{t('hello')} 👋</Text>
                    <Text style={styles.subGreeting}>{t('find_labour_near')}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Notification')}
                    style={styles.notifBtn}
                >
                    <AppIcon name="notifications-outline" size={28} color={Colors.textPrimary} />
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            {/* Primary Action Card */}
            <TouchableOpacity
                style={styles.primaryActionCard}
                onPress={() => navigation.navigate('PostNewWork')}
            >
                <View style={styles.iconCircle}>
                    <AppIcon name="add" size={32} color={Colors.white} />
                </View>
                <View style={styles.primaryCardText}>
                    <Text style={styles.primaryActionTitle}>{t('post_new_work')}</Text>
                    <Text style={styles.primaryActionSub}>Naya kaam post karein</Text>
                </View>
                <AppIcon name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {/* Active Requests Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('your_posted_jobs')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Deals')}>
                        <Text style={styles.seeAllText}>Sab dekhein</Text>
                    </TouchableOpacity>
                </View>

                {availableJobs.map((item, index) => (
                    <TouchableOpacity
                        key={item._id || index.toString()}
                        style={styles.requestCard}
                        onPress={() => navigation.navigate('JobApplications', { jobId: item._id })}
                    >
                        <View style={styles.requestInfo}>
                            <Text style={styles.workType}>{item.workType}</Text>
                            <View style={styles.locationRow}>
                                <AppIcon name="location-outline" size={12} color={Colors.textLight} />
                                <Text style={styles.locationText}>{item.location?.address || 'Location'}</Text>
                            </View>
                            <View style={styles.badgeRow}>
                                <View style={[styles.miniIconBadge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 0.5 }]}>
                                    <AppIcon name="people-outline" size={12} color="#16A34A" />
                                    <Text style={[styles.miniBadgeText, { color: '#16A34A' }]}>{item.filledWorkers}/{item.requiredWorkers}</Text>
                                </View>
                                <View style={[
                                    styles.miniIconBadge,
                                    {
                                        backgroundColor: (item.applications?.length || 0) > 0 ? '#FEF3C7' : '#F1F5F9',
                                        borderColor: (item.applications?.length || 0) > 0 ? '#FDE68A' : '#E2E8F0',
                                        borderWidth: 0.5
                                    }
                                ]}>
                                    <AppIcon
                                        name={(item.applications?.length || 0) > 0 ? "hand-right" : "hand-right-outline"}
                                        size={12}
                                        color={(item.applications?.length || 0) > 0 ? "#D97706" : "#64748B"}
                                    />
                                    <Text style={[
                                        styles.miniBadgeText,
                                        { color: (item.applications?.length || 0) > 0 ? "#D97706" : "#64748B" }
                                    ]}>
                                        {item.applications?.length || 0} Applied
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.actionColumn}>
                            <TouchableOpacity
                                style={styles.iconActionBtn}
                                onPress={() => handleEditJob(item)}
                            >
                                <AppIcon name="create-outline" size={20} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconActionBtn, { marginTop: 12 }]}
                                onPress={() => {
                                    setSelectedJobId(item._id);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <AppIcon name="trash-outline" size={20} color={Colors.error} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
                {availableJobs.length === 0 && (
                    <View style={styles.emptySmall}>
                        <AppIcon name="document-text-outline" size={40} color={Colors.border} />
                        <Text style={styles.emptyText}>Abhi koi kaam nahi hai</Text>
                    </View>
                )}
            </View>

            <View style={styles.tipCard}>
                <AppIcon name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.tipText}>Only nearby labour will see your request</Text>
            </View>

            <DeleteReasonModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSubmit={handleDeleteJob}
            />
        </ScrollView>
    );

    const renderLabourView = () => (
        <View style={styles.scrollView}>
            <View style={[styles.headerSection, { backgroundColor: '#F0FDF4' }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>{t('nearby_work_for_you')}</Text>
                    <View style={styles.locationIndicator}>
                        <AppIcon name="location-outline" size={16} color={Colors.primary} />
                        <Text style={styles.locationLabel}>Aapke Paas ka Kaam</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Notification')}
                    style={styles.notifBtn}
                >
                    <AppIcon name="notifications-outline" size={28} color={Colors.textPrimary} />
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            <FlatList
                data={availableJobs}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: spacing.md }}
                ListHeaderComponent={
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('available_jobs')}</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const myApplication = item.applications?.find((app: any) => app.labourId === user?.id || app.labourId?._id === user?.id);
                    const isApplied = !!myApplication;

                    return (
                        <TouchableOpacity
                            style={styles.jobCard}
                            onPress={() => navigation.navigate('Details', { itemId: item._id, itemType: 'job' })}
                        >
                            <View style={styles.jobMainInfo}>
                                <View style={styles.jobAvatar}>
                                    <AppIcon name="briefcase" size={24} color={Colors.primary} />
                                </View>
                                <View style={styles.jobDetailsCol}>
                                    <Text style={styles.jobRoleTitle}>{item.workType}</Text>
                                    <View style={styles.locationRow}>
                                        <AppIcon name="location-outline" size={12} color={Colors.textSecondary} />
                                        <Text style={styles.jobDistance}>
                                            {item.location?.area || 'Nearby'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.jobPriceCol}>
                                    <Text style={styles.jobPrice}>₹{item.paymentAmount}</Text>
                                    <Text style={styles.perDayLabel}>Dihadi</Text>
                                </View>
                            </View>

                            <View style={styles.jobFooterActions}>
                                {isApplied ? (
                                    <View style={[styles.statusInfoBadge, { backgroundColor: myApplication.status === 'approved' ? '#DCFCE7' : '#FEF3C7' }]}>
                                        <AppIcon
                                            name={myApplication.status === 'approved' ? 'checkmark-circle' : 'time-outline'}
                                            size={14}
                                            color={myApplication.status === 'approved' ? '#059669' : '#B45309'}
                                        />
                                        <Text style={[styles.statusInfoText, { color: myApplication.status === 'approved' ? '#059669' : '#B45309' }]}>
                                            {myApplication.status === 'approved' ? 'Mili hai' : 'Apply kar diya he'}
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.quickApplyBtn}
                                        onPress={() => handleApply(item._id)}
                                    >
                                        <AppIcon name="hand-right-outline" size={18} color={Colors.white} />
                                        <Text style={styles.quickApplyText}>Apply Karein</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={styles.viewDetailsIconBtn}
                                    onPress={() => navigation.navigate('Details', { itemId: item._id, itemType: 'job' })}
                                >
                                    <AppIcon name="eye-outline" size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIllustration}>
                            <AppIcon name="search-outline" size={80} color="#E2E8F0" />
                        </View>
                        <Text style={styles.emptyText}>Abhi koi naya kaam nahi hai</Text>
                        <Text style={styles.emptySubText}>Jaise hi kaam milega yahan dikhega</Text>
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
    jobMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    jobAvatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobDetailsCol: {
        flex: 1,
    },
    jobPriceCol: {
        alignItems: 'flex-end',
    },
    perDayLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    jobFooterActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    statusInfoBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    statusInfoText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    quickApplyBtn: {
        flex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    quickApplyText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    viewDetailsIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIllustration: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 40,
    },
    notifBtn: {
        position: 'relative',
        padding: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    seeAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    miniIconBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    miniBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    actionColumn: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: '#F1F5F9',
    },
    iconActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
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

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const { role } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    const renderContractorView = () => (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={[styles.headerSection, { backgroundColor: Colors.headerBlue }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>{t('hello')} 👋</Text>
                    <Text style={styles.subGreeting}>{t('find_labour_near')}</Text>
                </View>
                <AppIcon name="notifications-outline" size={24} color={Colors.textPrimary} />
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
                <Text style={styles.sectionTitle}>{t('in_progress')}</Text>

                {/* Mock Data for Active Requests */}
                {[1, 2].map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={styles.requestCard}
                        onPress={() => navigation.navigate('Details', { itemId: item.toString(), itemType: 'job' })}
                    >
                        <View style={styles.requestInfo}>
                            <Text style={styles.workType}>House Painting</Text>
                            <View style={styles.locationRow}>
                                <AppIcon name="location-outline" size={14} color={Colors.textLight} />
                                <Text style={styles.locationText}>Sec 14, Gurgaon</Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item === 1 ? '#FEF3C7' : '#D1FAE5' }]}>
                            <Text style={[styles.statusText, { color: item === 1 ? '#B45309' : '#059669' }]}>
                                {item === 1 ? t('pending') : t('completed')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tips Section */}
            <View style={styles.tipCard}>
                <AppIcon name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.tipText}>Only nearby labour will see your request</Text>
            </View>
        </ScrollView>
    );

    const renderLabourView = () => (
        <View style={styles.scrollView}>
            {/* Header Section */}
            <View style={[styles.headerSection, { backgroundColor: Colors.headerGreen }]}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>{t('nearby_work_for_you')}</Text>
                    <View style={styles.locationIndicator}>
                        <AppIcon name="location-outline" size={16} color={Colors.primary} />
                        <Text style={styles.locationLabel}>Gurgaon, Haryana</Text>
                    </View>
                </View>
                <View style={styles.onlineStatus}>
                    <Text style={styles.onlineText}>Online</Text>
                    <View style={styles.onlineDot} />
                </View>
            </View>

            {/* Nearby Work Cards */}
            <FlatList
                data={[1, 2, 3]}
                keyExtractor={(item) => item.toString()}
                contentContainerStyle={{ padding: spacing.layout.containerPaddding }}
                ListHeaderComponent={<Text style={styles.sectionTitle}>{t('available_jobs')}</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.jobCard}
                        onPress={() => navigation.navigate('Details', { itemId: item.toString(), itemType: 'job' })}
                    >
                        <View style={styles.jobHeader}>
                            <View>
                                <Text style={styles.jobRoleTitle}>{item === 1 ? 'Painter' : item === 2 ? 'Mistri' : 'Helper'}</Text>
                                <Text style={styles.jobDistance}>1.5 km away</Text>
                            </View>
                            <Text style={styles.jobPrice}>₹800/day</Text>
                        </View>

                        <View style={styles.jobActions}>
                            <TouchableOpacity style={styles.ignoreButton}>
                                <Text style={styles.ignoreButtonText}>{t('ignore')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => navigation.navigate('Details', { itemId: item.toString(), itemType: 'job' })}
                            >
                                <Text style={styles.acceptButtonText}>{t('accept')}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
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
        color: Colors.text,
    },
    subGreeting: {
        fontSize: 14,
        color: Colors.textLight,
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
        color: Colors.text,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: Colors.textLight,
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
        color: Colors.text,
    },
    jobDistance: {
        fontSize: 12,
        color: Colors.textLight,
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
        color: Colors.textLight,
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
        color: Colors.textLight,
        marginTop: 16,
    }
});

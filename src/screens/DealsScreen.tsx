import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { StatusTab } from '../components/deals/StatusTab';
import { DealCard } from '../components/deals/DealCard';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import { DealStatus } from '../types/deals';

const MOCK_DEALS = [
    { id: '1', workType: 'Painter / पेंटर', location: 'Noida Sec 62', date: 'Oct 24, 2025', status: 'active', userName: 'Sunil Kumar', payment: '₹1200/day', assignedLabourId: 'lab_001' },
    { id: '2', workType: 'Masonry / मिस्त्री', location: 'Greater Noida', date: 'Oct 22, 2025', status: 'completed', userName: 'Rajesh Contractor', payment: '₹8000 (Total)', assignedLabourId: 'lab_001' },
    { id: '3', workType: 'Helper / हेल्पर', location: 'Ghaziabad', date: 'Oct 20, 2025', status: 'completion_requested', userName: 'Amit Singh', payment: '₹600/day', assignedLabourId: 'lab_001' },
    { id: '4', workType: 'Brick Work', location: 'Indirapuram', date: 'Oct 15, 2025', status: 'active', userName: 'Vijay Mistri', payment: '₹1500/day', assignedLabourId: 'lab_001' },
];

export default function DealsScreen() {
    const { role } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<DealStatus | 'All'>('active');
    const [deals, setDeals] = useState(MOCK_DEALS);

    const tabs = ['active', 'completion_requested', 'completed'];
    const isContractor = role === 'contractor';

    const getTabLabel = (tab: string) => {
        switch (tab) {
            case 'active': return t('in_progress');
            case 'completion_requested': return t('pending');
            case 'completed': return t('finished');
            default: return tab;
        }
    };

    const handleStatusUpdate = (dealId: string, newStatus: DealStatus) => {
        const statusLabel = newStatus.replace('_', ' ');
        Alert.alert(
            "Update Status",
            `Are you sure you want to change this to ${statusLabel}?`,
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: () => {
                        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
                    }
                }
            ]
        );
    };

    const filteredDeals = deals.filter(deal => deal.status === activeTab);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('your_work_deals')}</Text>
                <Text style={styles.subTitle}>
                    {isContractor ? t('track_labour_progress') : t('manage_assigned_work')}
                </Text>
            </View>

            <StatusTab
                tabs={tabs}
                activeTab={activeTab}
                onTabPress={(tab) => setActiveTab(tab as any)}
                getLabel={getTabLabel}
            />

            <FlatList
                data={filteredDeals}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <DealCard
                        deal={item as any}
                        role={role || 'labour'}
                        onViewDetails={() => {
                            navigation.navigate('Details', {
                                itemId: item.id,
                                itemType: isContractor ? 'labour' : 'job',
                                initialStatus: item.status,
                                fromDeals: true
                            });
                        }}
                        onUpdateStatus={(newStatus) => handleStatusUpdate(item.id, newStatus)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIllustration}>
                            <AppIcon
                                name={activeTab === 'completed' ? 'checkmark-circle' : 'timer-outline'}
                                size={80}
                                color={Colors.border}
                            />
                        </View>
                        <Text style={styles.emptyText}>{t('no_deals_found')}</Text>
                        <Text style={styles.emptySubText}>{t('new_requests_appear_here')}</Text>

                        <TouchableOpacity
                            style={styles.emptyBtn}
                            onPress={() => navigation.navigate(isContractor ? 'PostNewWork' : 'Search')}
                        >
                            <Text style={styles.emptyBtnText}>
                                {isContractor ? t('post_new_work') : t('find_work')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: spacing.l,
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    subTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    listContent: {
        padding: spacing.l,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIllustration: {
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 30,
    },
    emptyBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
        elevation: 2,
    },
    emptyBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

import React, { useState, useEffect } from 'react';
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
import { DealStatus, Deal } from '../types/deals';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { setDeals } from '../features/deals/slice';

const MOCK_DEALS: Deal[] = [
    {
        id: '1',
        jobId: 'job_1',
        workType: 'Painter / पेंटर',
        location: { area: 'Noida Sec 62', city: 'Noida' },
        date: 'Oct 24, 2025',
        status: 'active',
        contractorName: 'Sunil Kumar',
        contractorId: 'c_1',
        labourName: 'Me',
        labourId: 'lab_001',
        payment: '₹1200/day',
        createdAt: '2025-10-24T10:00:00Z',
        updatedAt: '2025-10-24T10:00:00Z',
        userName: 'Sunil Kumar'
    },
    {
        id: '2',
        jobId: 'job_2',
        workType: 'Masonry / मिस्त्री',
        location: { area: 'Greater Noida', city: 'Noida' },
        date: 'Oct 22, 2025',
        status: 'completed',
        contractorName: 'Rajesh Contractor',
        contractorId: 'c_2',
        labourName: 'Me',
        labourId: 'lab_001',
        payment: '₹8000 (Total)',
        createdAt: '2025-10-22T10:00:00Z',
        updatedAt: '2025-10-22T10:00:00Z',
        userName: 'Rajesh Contractor'
    },
    {
        id: '3',
        jobId: 'job_3',
        workType: 'Helper / हेल्पर',
        location: { area: 'Ghaziabad', city: 'Ghaziabad' },
        date: 'Oct 20, 2025',
        status: 'completion_requested',
        contractorName: 'Amit Singh',
        contractorId: 'c_3',
        labourName: 'Me',
        labourId: 'lab_001',
        payment: '₹600/day',
        createdAt: '2025-10-20T10:00:00Z',
        updatedAt: '2025-10-20T10:00:00Z',
        userName: 'Amit Singh'
    },
];

export default function DealsScreen() {
    const { role, user } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // Select from Redux
    const deals = useSelector((state: RootState) => state.deals.deals);

    const [activeTab, setActiveTab] = useState<DealStatus | 'All'>('active');

    // Init data
    useEffect(() => {
        if (deals.length === 0) {
            // Transform MOCK_DEALS to match type if needed, but here we defined it to match Deal interface (mostly)
            // Note: MOCK_DEALS items above are tailored to satisfy Deal interface + UI needs
            // We might need to map 'userName' to deal props dynamically or keep it simple.
            // In DealCard, it uses 'userName'. In Deal interface, we have contractorName/labourName.
            // We will fix MOCK_DEALS object structure to be strictly compliant if TS complains, 
            // but for now we added compatible fields.

            // To ensure DealCard works (it expects userName), we need to ensure Deal objects have what DealCard needs 
            // OR Update DealCard to use new fields. 
            // Let's stick to the current MOCK_DEALS structure which works for DealCard, but cast it?
            // Actually I updated Deal interface. 
            // I should use the Deal interface which has contractorName etc.
            // DealCard expects { userName, ... }.
            // I'll adhere to the logic:

            dispatch(setDeals(MOCK_DEALS));
        }
    }, []);

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
                        const updatedDeals = deals.map(d => d.id === dealId ? { ...d, status: newStatus } : d);
                        dispatch(setDeals(updatedDeals));
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

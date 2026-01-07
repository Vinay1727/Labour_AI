import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { StatusTab } from '../components/deals/StatusTab';
import { DealCard } from '../components/deals/DealCard';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import { DealStatus, Deal } from '../types/deals';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { setDeals } from '../features/deals/slice';
import api from '../services/api';

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

    const [activeTab, setActiveTab] = useState<'applied' | 'active' | 'completed'>('active');
    const [loading, setLoading] = useState(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchDeals();
        }
    }, [isFocused]);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const res = await api.get('deals');
            if (res.data.success) {
                dispatch(setDeals(res.data.data));
            }
        } catch (err) {
            console.error('Fetch Deals Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['applied', 'active', 'completed'];
    const isContractor = role === 'contractor';

    const getTabLabel = (tab: string) => {
        switch (tab) {
            case 'applied': return isContractor ? t('applications') : t('applied' as any);
            case 'active': return t('in_progress');
            case 'completed': return t('finished');
            default: return tab;
        }
    };

    const handleStatusUpdate = async (dealId: string, newStatus: string) => {
        try {
            let endpoint = '';
            let data = {};

            if (newStatus === 'active' || newStatus === 'rejected') {
                endpoint = `deals/status`; // Internal API upgrade to handle body
                data = { dealId, status: newStatus };
            } else if (newStatus === 'completion_requested') {
                endpoint = `deals/${dealId}/request-completion`;
            } else if (newStatus === 'completed') {
                endpoint = `deals/${dealId}/approve-completion`;
            }

            if (!endpoint) return;

            const res = endpoint.includes('status')
                ? await api.put(endpoint, data)
                : await api.post(endpoint);

            if (res.data.success) {
                Alert.alert(t('success'), `Status updated to ${newStatus}`);
                fetchDeals();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Update failed');
        }
    };

    const filteredDeals = deals.filter(deal => {
        if (activeTab === 'active') {
            return deal.status === 'active' || deal.status === 'completion_requested';
        }
        return deal.status === activeTab;
    });



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
                keyExtractor={(item, index) => item.id || index.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <DealCard
                        deal={item as any}
                        role={role || 'labour'}
                        onViewDetails={() => {
                            navigation.navigate('Details', {
                                itemId: item.id,
                                itemType: isContractor ? 'labour' : 'job',
                                name: isContractor ? item.labourName : item.workType,
                                skills: isContractor ? [item.workType] : [],
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

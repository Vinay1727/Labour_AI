import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
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
import { RatingModal } from '../components/deals/RatingModal';
import { RejectionModal } from '../components/deals/RejectionModal';

export default function DealsScreen() {
    const { role, user: authUser } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const deals = useSelector((state: RootState) => state.deals.deals);

    const [activeTab, setActiveTab] = useState<'applied' | 'active'>('active');
    const [loading, setLoading] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedDealForRating, setSelectedDealForRating] = useState<any>(null);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedDealForRejection, setSelectedDealForRejection] = useState<string | null>(null);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [selectedDealForApproval, setSelectedDealForApproval] = useState<any>(null);

    const isFocused = useIsFocused();
    const isContractor = role === 'contractor';

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

    const confirmApproval = async (dealId: string, selectedSkill: string) => {
        try {
            setLoading(true);
            const res = await api.post('deals/approve', {
                dealId,
                selectedSkill
            });

            if (res.data.success) {
                Alert.alert(t('success' as any), `Approved for ${selectedSkill}`);
                setShowSkillModal(false);
                fetchDeals();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Approval failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (dealId: string, newStatus: string, extraData: any = {}) => {
        try {
            if (newStatus === 'rejected_completion') {
                setSelectedDealForRejection(dealId);
                setShowRejectionModal(true);
                return;
            }

            if (newStatus === 'approve_with_skill') {
                const deal = deals.find(d => d.id === dealId);
                if (!deal) return;
                const job = deal.jobId as any;
                if (job && typeof job === 'object' && job.skills && job.skills.length > 1) {
                    setSelectedDealForApproval(deal);
                    setShowSkillModal(true);
                    return;
                } else {
                    const skill = (job && job.skills?.[0]?.skillType) || (job && job.workType) || 'worker';
                    confirmApproval(dealId, skill);
                    return;
                }
            }

            let endpoint = '';
            let data = extraData;

            if (newStatus === 'active' || newStatus === 'rejected') {
                endpoint = `deals/status`;
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
                Alert.alert(t('success' as any), `Status updated successfully`);
                fetchDeals();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Update failed');
        }
    };

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            if (activeTab === 'active') {
                return ['assigned', 'active', 'completion_requested', 'finished'].includes(deal.status);
            }
            if (activeTab === 'applied') {
                return ['applied', 'rejected'].includes(deal.status);
            }
            return deal.status === activeTab;
        });
    }, [deals, activeTab]);

    const groupedAppliedDeals = useMemo(() => {
        if (activeTab !== 'applied') return [];
        const jobGroups: { [key: string]: any } = {};
        filteredDeals.forEach((deal: any) => {
            const jobId = deal.jobId?._id || deal.jobId;
            if (!jobId) return;
            if (!jobGroups[jobId]) {
                jobGroups[jobId] = {
                    job: deal.jobId,
                    applications: []
                };
            }
            jobGroups[jobId].applications.push(deal);
        });
        return Object.values(jobGroups);
    }, [filteredDeals, activeTab]);

    const submitRating = async (rating: number, comment: string) => {
        try {
            const res = await api.post('reviews', {
                dealId: selectedDealForRating.id,
                reviewedUserId: isContractor ? selectedDealForRating.labourId : selectedDealForRating.contractorId,
                rating,
                comment
            });
            if (res.data.success) {
                Alert.alert(t('success' as any), t('rating_submitted' as any));
                fetchDeals();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Rating failed');
        }
    };

    const getTabLabel = (tab: string) => {
        switch (tab) {
            case 'applied': return t('applied' as any);
            case 'active': return t('in_progress' as any);
            default: return tab;
        }
    };

    const renderAppliedGroup = ({ item: group }: any) => (
        <View style={styles.jobGroup}>
            <View style={styles.jobGroupHeader}>
                <AppIcon name="briefcase-outline" size={20} color={Colors.primary} />
                <Text style={styles.jobGroupTitle}>{group.job?.workType || 'Job'}</Text>
                <View style={styles.slotBadge}>
                    <Text style={styles.slotText}>
                        {group.job?.filledWorkers || 0}/{group.job?.requiredWorkers || 0} Slots
                    </Text>
                </View>
            </View>
            <View style={styles.jobLocationRow}>
                <AppIcon name="location-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.jobLocationText}>
                    {typeof group.job?.location === 'object' ? group.job.location.address : 'Local'}
                </Text>
            </View>

            {group.applications.map((deal: any) => (
                <DealCard
                    key={deal.id}
                    deal={deal}
                    role={role || 'labour'}
                    onViewDetails={() => navigation.navigate('Details', { itemId: deal.id, itemType: 'job', fromDeals: true })}
                    onUpdateStatus={(newStatus) => handleStatusUpdate(deal.id, newStatus)}
                    onViewProfile={() => {
                        const id = typeof deal.labourId === 'object' ? (deal.labourId as any)._id : deal.labourId;
                        navigation.navigate('LabourProfile', { labourId: id, name: deal.userName });
                    }}
                    onRatePress={() => {
                        setSelectedDealForRating(deal);
                        setShowRatingModal(true);
                    }}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{t('your_work_deals' as any)}</Text>
                    <Text style={styles.subTitle}>
                        {isContractor ? t('track_labour_progress' as any) : t('manage_assigned_work' as any)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.messageIconBtn}
                    onPress={() => navigation.navigate('Messages')}
                >
                    <AppIcon name="chatbubble-ellipses-outline" size={26} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <StatusTab
                tabs={['applied', 'active']}
                activeTab={activeTab}
                onTabPress={(tab) => setActiveTab(tab as any)}
                getLabel={getTabLabel}
            />

            {activeTab === 'applied' ? (
                <FlatList
                    data={groupedAppliedDeals}
                    keyExtractor={(item) => (item.job?._id || item.job)}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderAppliedGroup}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIllustration}>
                                <AppIcon name="search-outline" size={100} color="#E2E8F0" />
                            </View>
                            <Text style={styles.emptyText}>{t('no_deals_found' as any)}</Text>
                            <Text style={styles.emptySubText}>{t('deals_empty_helper' as any)}</Text>
                        </View>
                    }
                    onRefresh={fetchDeals}
                    refreshing={loading}
                />
            ) : (
                <FlatList
                    data={filteredDeals}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <DealCard
                            deal={item}
                            role={role || 'labour'}
                            onViewDetails={() => navigation.navigate('Details', { itemId: item.id, itemType: 'job', fromDeals: true })}
                            onUpdateStatus={(newStatus) => handleStatusUpdate(item.id, newStatus)}
                            onViewProfile={() => {
                                const id = typeof item.labourId === 'object' ? (item.labourId as any)._id : item.labourId;
                                navigation.navigate('LabourProfile', { labourId: id, name: item.userName });
                            }}
                            onRatePress={() => {
                                setSelectedDealForRating(item);
                                setShowRatingModal(true);
                            }}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIllustration}>
                                <AppIcon name="search-outline" size={100} color="#E2E8F0" />
                            </View>
                            <Text style={styles.emptyText}>{t('no_deals_found' as any)}</Text>
                            <Text style={styles.emptySubText}>{t('deals_empty_helper' as any)}</Text>
                        </View>
                    }
                    onRefresh={fetchDeals}
                    refreshing={loading}
                />
            )}

            {/* Skill Selection Modal */}
            <Modal
                visible={showSkillModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSkillModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.skillModalContent}>
                        <Text style={styles.modalTitle}>Select Skill for {selectedDealForApproval?.userName}</Text>
                        <Text style={styles.modalSubtitle}>Pick a role from the job requirements</Text>

                        <ScrollView style={styles.skillList}>
                            {selectedDealForApproval?.jobId?.skills?.map((skill: any) => {
                                const isFull = (skill.filledCount || 0) >= (skill.requiredCount || 0);
                                return (
                                    <TouchableOpacity
                                        key={skill.skillType}
                                        style={[styles.skillOption, isFull && styles.skillOptionDisabled]}
                                        onPress={() => !isFull && confirmApproval(selectedDealForApproval.id, skill.skillType)}
                                        disabled={isFull}
                                    >
                                        <View style={styles.skillOptionLeft}>
                                            <Text style={styles.skillOptionLabel}>{skill.skillType}</Text>
                                            <Text style={styles.skillOptionStats}>{skill.filledCount || 0}/{skill.requiredCount || 0} Filled</Text>
                                        </View>
                                        {isFull ? (
                                            <Text style={styles.fullText}>Full</Text>
                                        ) : (
                                            <AppIcon name="chevron-forward" size={20} color={Colors.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setShowSkillModal(false)}
                        >
                            <Text style={styles.closeBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {selectedDealForRating && (
                <RatingModal
                    visible={showRatingModal}
                    onClose={() => {
                        setShowRatingModal(false);
                        setSelectedDealForRating(null);
                    }}
                    onSubmit={submitRating}
                    userName={isContractor ? selectedDealForRating.labourName : selectedDealForRating.contractorName}
                    role={role || 'labour'}
                />
            )}

            <RejectionModal
                visible={showRejectionModal}
                onClose={() => {
                    setShowRejectionModal(false);
                    setSelectedDealForRejection(null);
                }}
                onSubmit={async (reasons, note) => {
                    try {
                        const res = await api.post(`deals/${selectedDealForRejection}/reject-completion`, {
                            reasonCodes: reasons,
                            note
                        });
                        if (res.data.success) {
                            Alert.alert(t('success' as any), "Rejected successfully");
                            setShowRejectionModal(false);
                            fetchDeals();
                        }
                    } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Rejection failed');
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: spacing.lg,
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    messageIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
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
        padding: spacing.lg,
        paddingBottom: 100,
    },
    jobGroup: {
        marginBottom: 20,
    },
    jobGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    jobGroupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textTransform: 'capitalize',
    },
    slotBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    slotText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    jobLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
        marginLeft: 2,
    },
    jobLocationText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIllustration: {
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    skillModalContent: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    skillList: {
        marginBottom: 20,
    },
    skillOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    skillOptionDisabled: {
        opacity: 0.5,
        backgroundColor: '#F1F5F9',
    },
    skillOptionLeft: {
        flex: 1,
    },
    skillOptionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textTransform: 'capitalize',
    },
    skillOptionStats: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    fullText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.error,
    },
    closeBtn: {
        padding: 16,
        alignItems: 'center',
    },
    closeBtnText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
});

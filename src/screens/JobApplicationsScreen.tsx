import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';

export default function JobApplicationsScreen({ route, navigation }: any) {
    const { jobId } = route.params;
    const { t } = useTranslation();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`jobs/${jobId}`);
            if (res.data.success) {
                setJob(res.data.data);
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to fetch details');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (labourId: string, action: 'approve' | 'reject', appliedSkill: string) => {
        try {
            const res = await api.post(`jobs/${jobId}/applications/${labourId}`, { action, appliedSkill });
            if (res.data.success) {
                Alert.alert('Success', `Application ${action}d`);
                fetchJobDetails();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update');
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const labour = item.labourId;
        const appliedSkill = item.appliedSkill || 'Helper';
        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => navigation.navigate('Details', {
                        itemId: labour._id,
                        itemType: 'labour',
                        name: labour.name,
                        skills: labour.skills || [appliedSkill]
                    })}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{labour.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.labourName}>{labour.name}</Text>
                        <View style={styles.skillRow}>
                            <Text style={styles.skillValue}>{appliedSkill}</Text>
                            {item.hasPartner && (
                                <View style={styles.teamTag}>
                                    <AppIcon name="people" size={12} color={Colors.white} />
                                    <Text style={styles.teamTagText}>Team: 1 + {item.partnerCount}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.locationRow}>
                            <AppIcon name="location-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.locationText}>{labour.location?.area || 'Local'}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, {
                        backgroundColor: item.status === 'pending' ? '#FEF3C7' : item.status === 'approved' ? '#D1FAE5' : '#FEE2E2'
                    }]}>
                        <Text style={[styles.statusText, {
                            color: item.status === 'pending' ? '#B45309' : item.status === 'approved' ? '#059669' : '#DC2626'
                        }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>

                {
                    item.status === 'pending' && (
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.btn, styles.rejectBtn]}
                                onPress={() => handleAction(labour._id, 'reject', appliedSkill)}
                            >
                                <Text style={styles.rejectBtnText}>{t('ignore')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.approveBtn]}
                                onPress={() => handleAction(labour._id, 'approve', appliedSkill)}
                            >
                                <Text style={styles.approveBtnText}>{t('approve')}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }

                {
                    item.status === 'approved' && (
                        <TouchableOpacity
                            style={styles.callBtn}
                            onPress={() => Linking.openURL(`tel:${labour.phone}`)}
                        >
                            <AppIcon name="call" size={18} color={Colors.white} />
                            <Text style={styles.callBtnText}>Call {labour.name}</Text>
                        </TouchableOpacity>
                    )
                }
            </View >
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{job?.workType} Applications</Text>
            </View>

            <View style={styles.summary}>
                <Text style={styles.summaryText}>
                    Progress: {job?.filledWorkers} / {job?.requiredWorkers} workers approved
                </Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {
                        width: `${(job?.filledWorkers / job?.requiredWorkers) * 100}%`
                    }]} />
                </View>
            </View>

            <FlatList
                data={job?.applications}
                keyExtractor={(item, index) => `${item.labourId?._id}_${item.appliedSkill}_${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <AppIcon name="people-outline" size={60} color={Colors.border} />
                        <Text style={styles.emptyText}>{t('no_applications')}</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.l,
        backgroundColor: Colors.white,
        gap: spacing.m,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    summary: {
        padding: spacing.l,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    list: {
        padding: spacing.l,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.m,
        marginBottom: spacing.m,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    info: {
        flex: 1,
    },
    labourName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    skillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    skillLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    skillValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    btn: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    rejectBtn: {
        borderWidth: 1,
        borderColor: Colors.border,
    },
    rejectBtnText: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    approveBtn: {
        backgroundColor: Colors.primary,
    },
    approveBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    callBtn: {
        flexDirection: 'row',
        backgroundColor: Colors.success,
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    callBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        color: Colors.textSecondary,
    },
    teamTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 4,
        marginLeft: 8,
    },
    teamTagText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    }
});

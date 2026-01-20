import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import { AttendanceRecord } from '../types/deals';

export default function AttendanceHistoryScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { dealId } = route.params as { dealId: string };

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get(`attendance/deal/${dealId}`);
            if (res.data.success) {
                setRecords(res.data.data);
            }
        } catch (err: any) {
            console.error('Fetch Attendance Error:', err);
            if (err.response?.status === 404) {
                setRecords([]);
            } else {
                Alert.alert('Error', err.response?.data?.message || 'Could not load attendance history');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: AttendanceRecord }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>

            <View style={styles.footerRow}>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'approved' ? Colors.success :
                        item.status === 'rejected' ? Colors.error : Colors.warning
                }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>

                {item.status === 'pending' && (
                    <View style={styles.hintContainer}>
                        <AppIcon name="chatbubble-ellipses-outline" size={14} color={Colors.textLight} />
                        <Text style={styles.pendingHint}>Approve in Chat</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('attendance_history')}</Text>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={(item) => item.id || (item as any)._id || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>{t('no_attendance')}</Text>
                        </View>
                    }
                />
            )}
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
        elevation: 2,
    },
    backBtn: {
        marginRight: spacing.m,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    listContent: {
        padding: spacing.l,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    date: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        color: Colors.textSecondary,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pendingHint: {
        fontSize: 12,
        color: Colors.textLight,
        fontStyle: 'italic',
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    }
});

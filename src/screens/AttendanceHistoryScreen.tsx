import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AttendanceRecord } from '../types/deals';

export default function AttendanceHistoryScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { role } = useAuth();
    const { dealId } = route.params as { dealId: string };
    const isContractor = role === 'contractor';

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
                // No attendance records found yet, keep records empty but don't show error alert
                setRecords([]);
            } else {
                Alert.alert('Error', err.response?.data?.message || 'Could not load attendance history');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (attendanceId: string, status: 'approved' | 'rejected') => {
        try {
            const res = await api.post('attendance/verify', { attendanceId, status });
            if (res.data.success) {
                Alert.alert('Success', `Attendance ${status}`);
                fetchAttendance();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Verification failed');
        }
    };

    const renderItem = ({ item }: { item: AttendanceRecord }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </View>

            <View style={styles.row}>
                <AppIcon name="location" size={16} color={Colors.primary} />
                <Text style={styles.location}>{item.location.address || `${item.location.latitude}, ${item.location.longitude}`}</Text>
            </View>

            {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
            )}

            <View style={styles.footerRow}>
                <View style={[styles.statusBadge, {
                    backgroundColor: item.status === 'approved' ? Colors.success :
                        item.status === 'rejected' ? Colors.error : Colors.warning
                }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>

                {isContractor && item.status === 'pending' && (
                    <View style={styles.verifyActions}>
                        <TouchableOpacity
                            style={[styles.miniBtn, { backgroundColor: Colors.success }]}
                            onPress={() => handleVerify(item.id, 'approved')}
                        >
                            <AppIcon name="checkmark" size={14} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.miniBtn, { backgroundColor: Colors.error }]}
                            onPress={() => handleVerify(item.id, 'rejected')}
                        >
                            <AppIcon name="close" size={14} color={Colors.white} />
                        </TouchableOpacity>
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
                    keyExtractor={(item, index) => item.id || index.toString()}
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
        marginBottom: 8,
    },
    date: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        color: Colors.textSecondary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    location: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verifyActions: {
        flexDirection: 'row',
        gap: 10,
    },
    miniBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
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

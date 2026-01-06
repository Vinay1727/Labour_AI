import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useTranslation } from '../context/LanguageContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { AttendanceRecord, Deal } from '../types/deals';

export default function AttendanceHistoryScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const { dealId } = route.params as { dealId: string };

    const deals = useSelector((state: RootState) => state.deals.deals);
    const deal = deals.find(d => d.id === dealId);
    const attendanceRecords = deal?.attendance || [];

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

            <View style={[styles.statusBadge, { backgroundColor: item.status === 'approved' ? Colors.success : Colors.warning }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
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

            <FlatList
                data={attendanceRecords}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{t('no_attendance')}</Text>
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

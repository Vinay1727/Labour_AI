import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface HistoryItem {
    id: string;
    workType: string;
    userName?: string; // Contractor name for labour, or N/A for contractor
    location: string;
    status: 'Applied' | 'Accepted' | 'Rejected' | 'Completed' | 'Active' | 'Deleted';
    date: string;
    labourCount?: string; // For contractors
}

interface WorkHistoryProps {
    role: 'labour' | 'contractor';
    userId: string;
}

export const WorkHistory = ({ role, userId }: WorkHistoryProps) => {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const isLabour = role === 'labour';

    useEffect(() => {
        // Mock API Call for history
        setTimeout(() => {
            if (isLabour) {
                setHistory([
                    { id: 'h1', workType: 'Painter', userName: 'Rajesh Buildcon', location: 'Sec 15, Noida', status: 'Completed', date: 'Dec 20, 2025' },
                    { id: 'h2', workType: 'Masonry', userName: 'Amit Kumar', location: 'Indirapuram', status: 'Rejected', date: 'Dec 15, 2025' },
                    { id: 'h3', workType: 'Helper', userName: 'Vinay Builders', location: 'Gurgaon', status: 'Accepted', date: 'Dec 10, 2025' },
                    { id: 'h4', workType: 'Wall Tiling', userName: 'Gaur City 2', location: 'Noida EX', status: 'Applied', date: 'Dec 05, 2025' },
                ]);
            } else {
                setHistory([
                    { id: 'c1', workType: 'House Painting', labourCount: '3/5', location: 'DLF Ph 3', status: 'Active', date: 'Dec 22, 2025' },
                    { id: 'c2', workType: 'Brick Work', labourCount: '2/2', location: 'Sec 62', status: 'Completed', date: 'Dec 18, 2025' },
                    { id: 'c3', workType: 'Electrical Repair', labourCount: '0/1', location: 'Noida', status: 'Deleted', date: 'Dec 12, 2025' },
                ]);
            }
            setLoading(false);
        }, 1000);
    }, [role]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return Colors.success;
            case 'Accepted': return Colors.primary;
            case 'Active': return Colors.success;
            case 'Rejected': return Colors.error;
            case 'Deleted': return Colors.textSecondary;
            case 'Applied': return Colors.warning;
            default: return Colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.workTitle}>{item.workType}</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={[styles.infoRow, { marginBottom: 6 }]}>
                    <AppIcon name={isLabour ? "business-outline" : "people-outline"} size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoValue}>{isLabour ? item.userName : `${item.labourCount} Workers`}</Text>
                </View>
                <View style={styles.infoRow}>
                    <AppIcon name="location-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoValue}>{item.location}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loaderText}>Loading history...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Work History</Text>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false} // Since this is inside another ScrollView
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No history found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.l,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: spacing.md,
    },
    historyCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    workTitle: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: typography.weight.bold,
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
    cardBody: {},
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    loaderContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loaderText: {
        marginTop: 10,
        color: Colors.textSecondary,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: Colors.textSecondary,
    }
});

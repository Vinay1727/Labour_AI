import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '../context/LanguageContext';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'approval' | 'rejection' | 'application' | 'attendance' | 'completion' | 'message' | 'rating' | 'update' | 'cancellation' | 'info';
    relatedId: string;
    route: string;
    isRead: boolean;
    createdAt: string;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'approval': return { name: 'checkmark-circle', color: Colors.success };
        case 'rejection': return { name: 'close-circle', color: Colors.error };
        case 'message': return { name: 'chatbubble-ellipses', color: Colors.primary };
        case 'attendance': return { name: 'location', color: Colors.info };
        case 'application': return { name: 'hammer', color: Colors.warning };
        case 'completion': return { name: 'star', color: '#F59E0B' };
        case 'cancellation': return { name: 'close-circle', color: Colors.error };
        case 'info': return { name: 'information-circle', color: Colors.info };
        default: return { name: 'notifications', color: Colors.textSecondary };
    }
};

export default function NotificationScreen() {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error('Fetch Notifications Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchNotifications();
        }
    }, [isFocused]);

    const handlePress = async (item: Notification) => {
        try {
            // Mark as read in backend
            if (!item.isRead) {
                await api.put(`notifications/${item._id}/read`);
                setNotifications(prev =>
                    prev.map(n => n._id === item._id ? { ...n, isRead: true } : n)
                );
            }

            // Route user
            switch (item.route) {
                case 'Chat':
                    navigation.navigate('Chat', { dealId: item.relatedId });
                    break;
                case 'JobApplications':
                    navigation.navigate('JobApplications', { jobId: item.relatedId });
                    break;
                case 'AttendanceHistory':
                    navigation.navigate('AttendanceHistory', { dealId: item.relatedId });
                    break;
                case 'Deals':
                    navigation.navigate('Main', { screen: 'Deals' });
                    break;
                case 'Rating':
                    navigation.navigate('Rating', { dealId: item.relatedId });
                    break;
                case 'Details':
                    navigation.navigate('Details', { itemId: item.relatedId, itemType: 'job' });
                    break;
                default:
                    navigation.navigate('Main');
            }
        } catch (err) {
            console.error('Notification Action Error:', err);
        }
    };

    const markAllRead = async () => {
        try {
            const res = await api.put('notifications/read-all');
            if (res.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            Alert.alert('Error', 'Could not mark all as read');
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const renderItem = ({ item }: { item: Notification }) => {
        const iconInfo = getIcon(item.type);
        const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                onPress={() => handlePress(item)}
            >
                <View style={[styles.iconBox, { backgroundColor: iconInfo.color + '15' }]}>
                    <AppIcon name={iconInfo.name as any} size={24} color={iconInfo.color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={[styles.title, !item.isRead && styles.boldText]}>{item.title}</Text>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.time}>{timeAgo}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('notifications_header' as any)}</Text>
                {notifications.some(n => !n.isRead) ? (
                    <TouchableOpacity onPress={markAllRead}>
                        <Text style={styles.markReadText}>{t('mark_all_read' as any)}</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 80 }} />}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AppIcon name="notifications-off-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>{t('no_notifications' as any)}</Text>
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
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    markReadText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingVertical: spacing.sm,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: Colors.white,
        marginHorizontal: spacing.md,
        marginVertical: 4,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    unreadCard: {
        backgroundColor: '#F0F7FF',
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    boldText: {
        fontWeight: 'bold',
    },
    message: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        color: Colors.textLight,
        marginTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 16,
    },
});

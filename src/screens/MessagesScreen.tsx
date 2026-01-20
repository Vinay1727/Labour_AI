import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ChatListItem } from '../components/chat/ChatListItem';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';

export default function MessagesScreen() {
    const { role } = useAuth();
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { t } = useTranslation();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChats = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const res = await api.get('/messages/active-chats');
            if (res.data.success) {
                setChats(res.data.data);
            }
        } catch (err) {
            console.error('Fetch Chats Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) fetchChats();
    }, [isFocused, fetchChats]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('messages_tab' as any)}</Text>
                </View>
                <Text style={styles.subTitle}>{t('work_conversations' as any)}</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.dealId}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChats(true); }} />
                    }
                    renderItem={({ item }) => (
                        <ChatListItem
                            name={item.otherUser.name}
                            workType={item.jobType}
                            lastMessage={item.lastMessage}
                            time={new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            unreadCount={0} // To be implemented with counts
                            onPress={() => navigation.navigate('Chat', {
                                dealId: item.dealId,
                                name: item.otherUser.name,
                                workType: item.jobType
                            })}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIllustration}>
                                <AppIcon name="chatbubbles-outline" size={100} color="#E2E8F0" />
                            </View>
                            <Text style={styles.emptyText}>{t('no_messages_hinglish' as any)}</Text>
                            <Text style={styles.emptySubText}>{t('no_messages_sub' as any)}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: spacing.l, backgroundColor: '#DBEAFE', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: spacing.m },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    backBtn: { marginRight: spacing.s, marginLeft: -spacing.s, padding: 4 },
    title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
    subTitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    listContent: { paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: spacing.xl },
    emptyIllustration: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.l, elevation: 2 },
    emptyIcon: { fontSize: 40 },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
    emptySubText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
});

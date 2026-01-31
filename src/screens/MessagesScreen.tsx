import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
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
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredChats, setFilteredChats] = useState<any[]>([]);

    const fetchChats = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const res = await api.get('/messages/active-chats');
            if (res.data.success) {
                setChats(res.data.data);
                setFilteredChats(res.data.data);
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

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredChats(chats);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = chats.filter(chat =>
                chat.otherUser.name.toLowerCase().includes(lowerQuery) ||
                chat.jobType.toLowerCase().includes(lowerQuery) ||
                chat.lastMessage.toLowerCase().includes(lowerQuery)
            );
            setFilteredChats(filtered);
        }
    }, [searchQuery, chats]);

    const handleCamera = () => {
        // Since we don't have a standalone Camera screen, we usually open details or profile
        Alert.alert('Status Camera', 'Feature coming soon! You can use camera in individual chats.');
    };

    const handleMenu = () => {
        navigation.navigate('Help'); // 'three dots' usually leads to settings/help
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <AppIcon name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Labour Chowk</Text>
                    <View style={styles.headerActions}>
                        {isSearching ? (
                            <View style={styles.searchBar}>
                                <TextInput
                                    autoFocus
                                    style={styles.searchInput}
                                    placeholder="Search chats..."
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                                    <AppIcon name="close" size={24} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.headerIcon} onPress={handleCamera}>
                                    <AppIcon name="camera-outline" size={22} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.headerIcon} onPress={() => setIsSearching(true)}>
                                    <AppIcon name="search-outline" size={22} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.headerIcon} onPress={handleMenu}>
                                    <AppIcon name="ellipsis-vertical" size={22} color={Colors.white} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
                <View style={styles.tabs}>
                    <Text style={[styles.tabText, styles.activeTab]}>CHATS</Text>
                </View>
            </View>


            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#075E54" />
                </View>
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.dealId}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChats(true); }} tintColor="#075E54" />
                    }
                    renderItem={({ item }) => (
                        <ChatListItem
                            name={item.otherUser.name}
                            workType={item.jobType}
                            lastMessage={item.lastMessage}
                            time={new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            unreadCount={item.unreadCount}
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
                                <AppIcon name="chatbubbles-outline" size={80} color="#E2E8F0" />
                            </View>
                            <Text style={styles.emptyText}>{t('no_messages_hinglish' as any)}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    header: { backgroundColor: '#075E54', paddingTop: spacing.xs },
    headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 },
    backBtn: { marginRight: 8 },
    title: { fontSize: 20, fontWeight: 'bold', color: Colors.white, flex: 1 },
    headerActions: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    headerIcon: { marginLeft: 20 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, marginLeft: 10 },
    searchInput: { flex: 1, color: Colors.white, fontSize: 16, paddingVertical: 5 },
    tabs: { flexDirection: 'row', marginTop: 8 },
    tabText: { flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 'bold', paddingVertical: 12 },
    activeTab: { color: Colors.white, borderBottomWidth: 3, borderBottomColor: Colors.white },
    listContent: { paddingBottom: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: spacing.xl },
    emptyIllustration: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.l },
    emptyText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
});


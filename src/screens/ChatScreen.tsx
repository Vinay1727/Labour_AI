import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { MessageBubble } from '../components/chat/MessageBubble';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ChatScreen({ route, navigation }: any) {
    const { dealId, name, workType } = route.params || {};
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const isContractor = user?.role === 'contractor';
    const initial = name?.charAt(0).toUpperCase() || '?';

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get(`messages/history/${dealId}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('Fetch History Error:', err);
        } finally {
            setLoading(false);
        }
    }, [dealId]);

    useEffect(() => {
        fetchHistory();
        // Polling for new messages every 5 seconds (Simple implementation without Socket.io for now)
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [fetchHistory]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const messageData = {
            dealId,
            message: inputText.trim(),
            receiverId: isContractor ? messages[0]?.labourId || '' : messages[0]?.contractorId || ''
            // Better: get receiverId from the Deal object or history
        };

        // UI Optimistic Update
        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId,
            message: inputText.trim(),
            senderId: user?.id,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');

        try {
            await api.post('messages/send', {
                dealId,
                message: optimisticMsg.message
            });
            fetchHistory(); // Refresh to get official data
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AppIcon name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.workType} numberOfLines={1}>{workType}</Text>
                </View>

                {isContractor && (
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => Alert.alert('Calling...', `Connecting you to ${name}`)}
                    >
                        <AppIcon name="call-outline" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Chat Area */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <MessageBubble
                            text={item.message}
                            time={new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            isSent={item.senderId === user?.id}
                        />
                    )}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.attachButton}>
                        <AppIcon name="add" size={28} color={Colors.textLight} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={Colors.textLight}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        disabled={!inputText.trim()}
                        onPress={handleSend}
                    >
                        <AppIcon name="send" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, backgroundColor: Colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, zIndex: 10 },
    backButton: { padding: spacing.s, marginRight: spacing.xs },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.s },
    avatarText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
    headerInfo: { flex: 1 },
    name: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
    workType: { fontSize: 12, color: Colors.textLight },
    callButton: { padding: spacing.s },
    chatContent: { paddingVertical: spacing.m, paddingHorizontal: spacing.s },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    inputBar: { flexDirection: 'row', alignItems: 'center', padding: spacing.s, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    attachButton: { padding: spacing.s },
    input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: spacing.s, fontSize: 15, maxHeight: 100, color: Colors.text },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { backgroundColor: '#E2E8F0' },
});

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
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';

export default function ChatScreen({ route, navigation }: any) {
    const { dealId, name, workType } = route.params || {};
    const { user } = useAuth();
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({});
    const flatListRef = useRef<FlatList>(null);

    const isContractor = user?.role === 'contractor';
    const initial = name?.charAt(0).toUpperCase() || '?';

    // Helper to get base URL for images from api service
    const getBaseUrl = () => {
        const baseURL = api.defaults.baseURL || '';
        return baseURL.split('/api')[0] + '/';
    };

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get(`messages/history/${dealId}`);
            if (res.data.success) {
                setMessages(res.data.data.reverse());
            }
        } catch (err) {
            console.error('Fetch History Error:', err);
        } finally {
            setLoading(false);
        }
    }, [dealId]);

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [fetchHistory]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId,
            message: inputText.trim(),
            senderId: user?.id,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [optimisticMsg, ...prev]);
        setInputText('');

        try {
            await api.post('messages/send', {
                dealId,
                message: optimisticMsg.message
            });
            fetchHistory();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempId));
        }
    };

    const handleApproveAttendance = async (attendanceId: string, messageId: string) => {
        if (!attendanceId) return;
        try {
            setApprovingIds(prev => ({ ...prev, [messageId]: true }));
            const res = await api.patch(`attendance/${attendanceId}/approve`);
            if (res.data.success) {
                Alert.alert('Success', 'Attendance Approved ✅');
                fetchHistory(); // Refresh to show updated state if needed
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Approval failed');
        } finally {
            setApprovingIds(prev => ({ ...prev, [messageId]: false }));
        }
    };

    const handleDeclineAttendance = async (attendanceId: string, messageId: string) => {
        if (!attendanceId) return;
        try {
            setApprovingIds(prev => ({ ...prev, [messageId]: true }));
            const res = await api.patch(`attendance/${attendanceId}/reject`);
            if (res.data.success) {
                Alert.alert('Status Updated', 'Attendance Declined ❌');
                fetchHistory();
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Action failed');
        } finally {
            setApprovingIds(prev => ({ ...prev, [messageId]: false }));
        }
    };

    const renderMessageItem = ({ item }: { item: any }) => {
        const isMyMessage = (item.senderId?.toString() === user?.id?.toString()) ||
            (item.senderId?.toString() === (user as any)?._id?.toString());

        if (item.messageType === 'attendance_proof') {
            return (
                <View style={[styles.attendanceCard]}>
                    <Text style={styles.attendanceHeader}>📍 {t('attendance_marked' as any)}</Text>
                    {item.imageUrl && (
                        <Image
                            source={{ uri: `${getBaseUrl()}${item.imageUrl}` }}
                            style={styles.attendanceImage}
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.attendanceInfo}>
                        <View style={styles.infoRow}>
                            <AppIcon name="location-outline" size={14} color={Colors.textLight} />
                            <Text style={styles.locationTextSmall}>
                                {item.location?.latitude.toFixed(4)}, {item.location?.longitude.toFixed(4)}
                            </Text>
                        </View>
                        <Text style={styles.timestampSmall}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    {isContractor ? (
                        item.status === 'pending' ? (
                            <View style={styles.attendanceActions}>
                                <TouchableOpacity
                                    style={[styles.approveBtn, styles.halfBtn, approvingIds[item._id] && styles.approveBtnDisabled]}
                                    disabled={approvingIds[item._id]}
                                    onPress={() => handleApproveAttendance(item.attendanceId, item._id)}
                                >
                                    {approvingIds[item._id] ? (
                                        <ActivityIndicator size="small" color={Colors.white} />
                                    ) : (
                                        <>
                                            <AppIcon name="checkmark" size={18} color={Colors.white} />
                                            <Text style={styles.approveBtnText}>Approve</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.declineBtn, styles.halfBtn, approvingIds[item._id] && styles.approveBtnDisabled]}
                                    disabled={approvingIds[item._id]}
                                    onPress={() => handleDeclineAttendance(item.attendanceId, item._id)}
                                >
                                    <AppIcon name="close" size={18} color={Colors.white} />
                                    <Text style={styles.approveBtnText}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={[styles.statusBanner, { backgroundColor: item.status === 'approved' ? '#DCFCE7' : '#FEE2E2' }]}>
                                <AppIcon
                                    name={item.status === 'approved' ? "checkmark-circle" : "close-circle"}
                                    size={18}
                                    color={item.status === 'approved' ? Colors.success : Colors.error}
                                />
                                <Text style={[styles.statusBannerText, { color: item.status === 'approved' ? Colors.success : Colors.error }]}>
                                    Attendance {item.status === 'approved' ? 'Approved' : 'Rejected'}
                                </Text>
                            </View>
                        )
                    ) : (
                        <View style={styles.labourStatus}>
                            <AppIcon
                                name={item.status === 'approved' ? "checkmark-circle" : item.status === 'rejected' ? "close-circle" : "time-outline"}
                                size={16}
                                color={item.status === 'approved' ? Colors.success : item.status === 'rejected' ? Colors.error : Colors.primary}
                            />
                            <Text style={[
                                styles.labourStatusText,
                                item.status === 'approved' && { color: Colors.success },
                                item.status === 'rejected' && { color: Colors.error }
                            ]}>
                                {item.status === 'approved' ? 'Approved by Contractor' :
                                    item.status === 'rejected' ? 'Rejected by Contractor' :
                                        'Waiting for contractor approval'}
                            </Text>
                        </View>
                    )}
                </View>
            );
        }

        return (
            <View style={[
                styles.bubbleContainer,
                isMyMessage ? styles.bubbleRight : styles.bubbleLeft
            ]}>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id || Math.random().toString()}
                    inverted={true}
                    contentContainerStyle={styles.chatContent}
                    renderItem={renderMessageItem}
                    showsVerticalScrollIndicator={false}
                />
            )}

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
    bubbleContainer: {
        maxWidth: '75%',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginBottom: 8,
        elevation: 1,
    },
    bubbleRight: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
        borderTopRightRadius: 4,
    },
    bubbleLeft: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 10,
        color: Colors.textLight,
        alignSelf: 'flex-end',
    },
    inputBar: { flexDirection: 'row', alignItems: 'center', padding: spacing.s, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    attachButton: { padding: spacing.s },
    input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: spacing.s, fontSize: 15, maxHeight: 100, color: Colors.text },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { backgroundColor: '#E2E8F0' },
    // Attendance Card Styles
    attendanceCard: {
        alignSelf: 'center',
        backgroundColor: Colors.white,
        width: '85%',
        padding: spacing.m,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        elevation: 2,
        marginVertical: spacing.m,
    },
    attendanceHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: spacing.s,
        textAlign: 'center',
    },
    attendanceImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: spacing.s,
    },
    attendanceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationTextSmall: {
        fontSize: 12,
        color: Colors.textLight,
    },
    timestampSmall: {
        fontSize: 11,
        color: Colors.textLight,
    },
    approveBtn: {
        backgroundColor: Colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    declineBtn: {
        backgroundColor: Colors.error,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    attendanceActions: {
        flexDirection: 'row',
        gap: 8,
    },
    halfBtn: {
        flex: 1,
    },
    approveBtnDisabled: {
        opacity: 0.6,
    },
    approveBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    labourStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
    },
    labourStatusText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 12,
    },
    statusBannerText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

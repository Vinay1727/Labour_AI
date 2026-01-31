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
    Image,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';
import { Audio } from 'expo-av';

export default function ChatScreen({ route, navigation }: any) {
    const { dealId, name, workType } = route.params || {};
    const { user } = useAuth();
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({});
    const [otherUser, setOtherUser] = useState<any>(null);
    const [dealStatus, setDealStatus] = useState<string>('');
    const flatListRef = useRef<FlatList>(null);

    // Voice Typing State
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);

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
                const rawData = res.data.data;
                let history = [];

                if (Array.isArray(rawData)) {
                    // Backward compatibility: rawData is the messages array
                    history = rawData;
                } else if (rawData && Array.isArray(rawData.messages)) {
                    // New format: rawData is { messages, otherUser, status }
                    history = rawData.messages;
                    setOtherUser(rawData.otherUser);
                    setDealStatus(rawData.status);
                }

                if (history) {
                    setMessages([...history].reverse());
                }
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
            createdAt: new Date().toISOString(),
            isRead: false
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

    // Voice Typing Logic
    const startRecording = async () => {
        try {
            // Cleanup previous if exists
            if (recording) {
                try {
                    await recording.stopAndUnloadAsync();
                } catch (e) { }
                setRecording(null);
            }

            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') return Alert.alert('Permission required', 'Microphone access needed for voice typing');

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(newRecording);
            setIsRecording(true);
        } catch (err) {
            console.error('Voice failed', err);
            setIsRecording(false);
            setRecording(null);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null); // Clear after unloading
            if (uri) sendVoiceToText(uri);
        } catch (err) {
            console.error('Stop recording error', err);
            setRecording(null);
        }
    };

    const sendVoiceToText = async (uri: string) => {
        try {
            const formData = new FormData();
            formData.append('audio', { uri, name: 'voice.m4a', type: 'audio/m4a' } as any);
            const res = await api.post('search/voice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success && res.data.data.query) {
                setInputText(prev => (prev ? prev + ' ' : '') + res.data.data.query);
            }
        } catch (err) { console.error('Voice Typing Error', err); }
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

    const handleCall = () => {
        if (otherUser?.phone) {
            Linking.openURL(`tel:${otherUser.phone}`);
        } else {
            Alert.alert('Error', 'Phone number not available');
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
                <View style={styles.messageMeta}>
                    <Text style={styles.timeText}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMyMessage && (
                        <View style={styles.ticksContainer}>
                            <AppIcon
                                name="checkmark-done"
                                size={16}
                                color={item.isRead ? "#34B7F1" : "#94A3B8"}
                                style={styles.ticks}
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AppIcon name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.onlineStatus}>{workType}</Text>
                </View>

                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <AppIcon name="videocam" size={22} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={handleCall}>
                        <AppIcon name="call" size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <AppIcon name="ellipsis-vertical" size={22} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.chatBackground}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#075E54" />
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
                    <View style={styles.inputContainer}>
                        <View style={styles.inputBar}>
                            <TouchableOpacity style={styles.inputAction}>
                                <AppIcon name="happy-outline" size={24} color="#6B7280" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                placeholder="Message"
                                placeholderTextColor="#6B7280"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity style={styles.inputAction}>
                                <AppIcon name="attach" size={24} color="#6B7280" />
                            </TouchableOpacity>
                            {!inputText.trim() && (
                                <TouchableOpacity style={styles.inputAction}>
                                    <AppIcon name="camera" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.roundBtn, isRecording && styles.roundBtnActive]}
                            onPress={inputText.trim() ? handleSend : undefined}
                            onPressIn={!inputText.trim() ? startRecording : undefined}
                            onPressOut={!inputText.trim() ? stopRecording : undefined}
                        >
                            <AppIcon
                                name={inputText.trim() ? "send" : (isRecording ? "mic" : "mic-outline")}
                                size={22}
                                color={Colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#075E54' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#075E54',
        paddingHorizontal: 8
    },
    backButton: { padding: 4 },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4
    },
    avatarText: { color: '#9CA3AF', fontSize: 16, fontWeight: 'bold' },
    headerInfo: { flex: 1, marginLeft: 4 },
    name: { fontSize: 16, fontWeight: 'bold', color: Colors.white },
    onlineStatus: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    headerIcons: { flexDirection: 'row' },
    headerIcon: { padding: 10 },
    chatBackground: { flex: 1, backgroundColor: '#E5DDD5' },
    chatContent: { paddingVertical: spacing.s, paddingHorizontal: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bubbleContainer: {
        maxWidth: '85%',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    bubbleRight: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6',
    },
    bubbleLeft: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
    },
    messageText: { fontSize: 16, color: '#111827' },
    messageMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 2,
    },
    timeText: { fontSize: 11, color: '#6B7280' },
    ticksContainer: { marginLeft: 4 },
    ticks: { marginTop: 2 },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 6 },
    inputBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.white,
        borderRadius: 25,
        paddingHorizontal: 8,
        paddingVertical: 5,
        marginRight: 6
    },
    inputAction: { padding: 8 },
    input: { flex: 1, fontSize: 16, maxHeight: 120, paddingVertical: 8, color: '#111827' },
    roundBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#128C7E',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    roundBtnActive: { backgroundColor: '#F44336', transform: [{ scale: 1.2 }] },
    // Attendance Card Styles (remains same but colors adjusted for background)
    attendanceCard: {
        alignSelf: 'center',
        backgroundColor: Colors.white,
        width: '90%',
        padding: spacing.m,
        borderRadius: 12,
        elevation: 2,
        marginVertical: 8,
    },
    attendanceHeader: { fontSize: 15, fontWeight: 'bold', color: Colors.text, marginBottom: 8, textAlign: 'center' },
    attendanceImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
    attendanceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationTextSmall: { fontSize: 12, color: Colors.textLight },
    timestampSmall: { fontSize: 11, color: Colors.textLight },
    attendanceActions: { flexDirection: 'row', gap: 8 },
    halfBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6, gap: 6 },
    approveBtn: { backgroundColor: Colors.success },
    declineBtn: { backgroundColor: Colors.error },
    approveBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 14 },
    statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 6 },
    statusBannerText: { fontSize: 14, fontWeight: 'bold' },
    labourStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, backgroundColor: '#F0F9FF', borderRadius: 6 },
    labourStatusText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
    approveBtnDisabled: { opacity: 0.6 },
});


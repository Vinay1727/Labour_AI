import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AttendanceScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { t } = useTranslation();
    const { user, role } = useAuth();

    // Params: dealId
    const { dealId } = route.params as { dealId: string };

    const [deal, setDeal] = useState<any>(null);
    const [status, setStatus] = useState<'not_marked' | 'pending' | 'approved' | 'rejected'>('not_marked');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingDeal, setFetchingDeal] = useState(true);
    const [verifyingLoc, setVerifyingLoc] = useState(false);

    useEffect(() => {
        // Strict Role Check
        if (role !== 'labour') {
            Alert.alert('Access Denied', 'Only labourers can mark attendance.');
            navigation.goBack();
            return;
        }

        loadInitialData();

        // Poll for status updates (e.g., if contractor approves/rejects via chat)
        const interval = setInterval(fetchAttendanceStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAttendanceStatus = async () => {
        try {
            const attendanceRes = await api.get(`attendance/deal/${dealId}`);
            if (attendanceRes.data.success) {
                const records = attendanceRes.data.data;
                const todayStr = new Date().toISOString().split('T')[0];
                const todayRecord = records.find((r: any) => r.date.startsWith(todayStr));
                if (todayRecord) {
                    setStatus(todayRecord.status);
                }
            }
        } catch (err) {
            console.error('Fetch Attendance Status Error:', err);
        }
    };

    const loadInitialData = async () => {
        try {
            setFetchingDeal(true);
            // 1. Fetch Deal details
            const dealRes = await api.get(`deals/${dealId}`);
            if (dealRes.data.success) {
                setDeal(dealRes.data.data);
            }

            // 2. Check if already marked today
            await fetchAttendanceStatus();

            // 3. Auto-start location
            verifyLocation();

        } catch (err) {
            console.error('Attendance Init Error:', err);
        } finally {
            setFetchingDeal(false);
        }
    };

    const verifyLocation = async () => {
        setVerifyingLoc(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Error', 'Location permission is required to mark attendance.');
                setVerifyingLoc(false);
                return;
            }

            // Get last known location immediately for speed
            let lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown) {
                setLocation(lastKnown);
            }

            // Get current location with Balanced accuracy (much faster than High)
            let currentLoc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000
            });
            setLocation(currentLoc);

            try {
                let addressResponse = await Location.reverseGeocodeAsync({
                    latitude: currentLoc.coords.latitude,
                    longitude: currentLoc.coords.longitude
                });

                if (addressResponse && addressResponse.length > 0) {
                    const addr = addressResponse[0];
                    setAddress(`${addr.name || ''} ${addr.street || ''}, ${addr.city}`);
                }
            } catch (e) {
                setAddress('Location captured successfully');
            }
        } catch (error) {
            console.error("GPS Error:", error);
            // Don't block the user with an alert unless it's a critical failure
        } finally {
            setVerifyingLoc(false);
        }
    };

    const takePicture = async () => {
        try {
            const result = await ImagePicker.requestCameraPermissionsAsync();
            if (result.status !== 'granted') {
                Alert.alert('Permission Error', 'Camera permission is required');
                return;
            }

            const pickerResult = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.7,
            });

            if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
                const capturedUri = pickerResult.assets[0].uri;
                setImage(capturedUri);
            }
        } catch (err) {
            Alert.alert("Camera Error", "Could not capture photo. Please try again.");
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            Alert.alert('Photo Required', "Please take a selfie first");
            return;
        }

        let currentLoc = location;

        // If location is missing, try one last quick fetch
        if (!currentLoc) {
            setLoading(true);
            try {
                const quickLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (quickLoc) {
                    currentLoc = quickLoc;
                    setLocation(quickLoc);
                }
            } catch (err) {
                console.error("Last minute GPS fetch failed", err);
            }
        }

        if (!currentLoc) {
            Alert.alert('GPS Required', "We could not verify your location. Please ensure GPS is ON and try again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('dealId', dealId);
            formData.append('location', JSON.stringify({
                type: 'Point',
                coordinates: [currentLoc.coords.longitude, currentLoc.coords.latitude],
                address: address
            }));

            // Prepare image file for upload
            const filename = image.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri: image,
                name: filename,
                type: type,
            } as any);

            const res = await api.post('attendance/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                Alert.alert(
                    'Success',
                    'Attendance submitted successfully!',
                    [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Deals' }) }]
                );
            }
        } catch (error: any) {
            Alert.alert('Submission Failed', error.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingDeal) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        );
    }

    const todayDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const canSubmit = image && (status === 'not_marked' || status === 'rejected') && !loading;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{t('mark_attendance' as any)}</Text>
                    {deal && (
                        <Text style={styles.headerSub}>
                            {deal.jobId?.workType || deal.workType} • {deal.jobId?.location?.area || deal.location?.area}
                        </Text>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* SECTION 1: Date & Status */}
                <View style={styles.statusCard}>
                    <View>
                        <Text style={styles.dateLabel}>{t('today' as any)}</Text>
                        <Text style={styles.dateValue}>{todayDate}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        {
                            backgroundColor: status === 'approved' ? '#D1FAE5' :
                                status === 'pending' ? '#FEF3C7' :
                                    status === 'rejected' ? '#FEE2E2' : '#E5E7EB'
                        }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            {
                                color: status === 'approved' ? '#059669' :
                                    status === 'pending' ? '#B45309' :
                                        status === 'rejected' ? '#DC2626' : '#6B7280'
                            }
                        ]}>
                            {status === 'not_marked' ? (t('not_marked' as any)).toUpperCase() : status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* SECTION 2: Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('verify_location' as any)}</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: location ? Colors.success : Colors.primaryLight }]}>
                                <AppIcon name="location" size={20} color={location ? Colors.white : Colors.primary} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.rowTitle}>GPS Captured</Text>
                                <Text style={styles.rowSub}>
                                    {verifyingLoc ? 'Fetching GPS...' : location ? address : 'Waiting for GPS...'}
                                </Text>
                            </View>
                            {!location && !verifyingLoc && (
                                <TouchableOpacity onPress={verifyLocation}>
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* SECTION 3: Photo Proof */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Step 2: Take Site Selfie</Text>
                    <View style={styles.photoCard}>
                        {image ? (
                            <View style={{ alignItems: 'center' }}>
                                <View style={styles.imagePreviewWrapper}>
                                    <Image source={{ uri: image }} style={styles.imagePreview} />
                                    <View style={styles.uploadSuccessBadge}>
                                        <AppIcon name="checkmark-done-circle" size={24} color={Colors.white} />
                                        <Text style={styles.uploadSuccessText}>Image Ready!</Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.retakeBtnInCard} onPress={takePicture}>
                                    <AppIcon name="camera-reverse" size={18} color={Colors.textSecondary} />
                                    <Text style={styles.retakeTextSmall}>{t('retake_photo' as any)}</Text>
                                </TouchableOpacity>

                                {canSubmit ? (
                                    <TouchableOpacity
                                        style={[styles.hugeSendBtn, loading && styles.submitBtnDisabled]}
                                        onPress={handleSubmit}
                                        activeOpacity={0.9}
                                        disabled={loading}
                                    >
                                        <View style={styles.hugeSendIconBox}>
                                            {loading ? <ActivityIndicator color={Colors.white} /> : <AppIcon name="send" size={24} color={Colors.white} />}
                                        </View>
                                        <View>
                                            <Text style={styles.hugeSendText}>SEND ATTENDANCE</Text>
                                            <Text style={styles.hugeSendSub}>Mark attendance for today</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    status !== 'not_marked' && (
                                        <View style={styles.statusHelper}>
                                            <Text style={styles.helperText}>Attendance Already Marked</Text>
                                        </View>
                                    )
                                )}
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                                <View style={styles.captureIconBox}>
                                    <AppIcon name="camera" size={32} color={Colors.primary} />
                                </View>
                                <Text style={styles.captureText}>{t('take_selfie_site' as any)}</Text>
                                <Text style={styles.captureHint}>Photo is required to prove you are at site</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Information Rule */}
                <View style={[styles.infoBox, { marginTop: 20 }]}>
                    <AppIcon name="information-circle" size={20} color={Colors.info} />
                    <Text style={styles.infoText}>{t('attendance_warning_rule' as any)}</Text>
                </View>

            </ScrollView>

            {!image && (
                <View style={[styles.footer, { paddingBottom: 25 }]}>
                    <TouchableOpacity
                        style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <>
                                <AppIcon name="paper-plane" size={20} color={Colors.white} />
                                <Text style={styles.submitBtnText}>SEND ATTENDANCE</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    backBtn: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    headerSub: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    content: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    statusCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: spacing.l,
        borderRadius: 20,
        marginBottom: spacing.l,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    dateLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.md,
        elevation: 1,
    },
    photoCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 12,
        elevation: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContent: {
        flex: 1,
        marginLeft: 12,
    },
    rowTitle: {
        fontSize: 14,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
    },
    rowSub: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    retryText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    captureBtn: {
        height: 200,
        width: '100%',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    captureText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    captureHint: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    imagePreviewWrapper: {
        width: '100%',
        height: 300,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    uploadSuccessBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: Colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    uploadSuccessText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    retakeBtnInCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    retakeTextSmall: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    hugeSendBtn: {
        width: '100%',
        backgroundColor: Colors.success,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginTop: 10,
        elevation: 10,
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
    },
    hugeSendIconBox: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hugeSendText: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    hugeSendSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    waitingLocBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 20,
    },
    waitingLocText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EBF8FF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#2B6CB0',
        lineHeight: 18,
    },
    statusHelper: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
    },
    helperText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    footer: {
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    submitBtn: {
        backgroundColor: Colors.success,
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        elevation: 8,
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitBtnDisabled: {
        backgroundColor: '#E2E8F0',
        elevation: 0,
        shadowOpacity: 0,
    },
    submitBtnText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

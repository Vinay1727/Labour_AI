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
import { useDispatch } from 'react-redux';
import { addAttendance } from '../features/deals/slice';
import { AttendanceRecord } from '../types/deals';

export default function AttendanceScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // Params: dealId
    const { dealId } = route.params as { dealId: string };

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        verifyLocation();
    }, []);

    const verifyLocation = async () => {
        setVerifying(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setVerifying(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            // Reverse geocode to get address (Optional but nice)
            try {
                let addressResponse = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                if (addressResponse && addressResponse.length > 0) {
                    const addr = addressResponse[0];
                    setAddress(`${addr.name || ''} ${addr.street || ''}, ${addr.city}`);
                }
            } catch (e) {
                console.log("Geocoding failed", e);
            }

        } catch (error) {
            Alert.alert("Error fetching location");
        } finally {
            setVerifying(false);
        }
    };

    const takePicture = async () => {
        const result = await ImagePicker.requestCameraPermissionsAsync();
        if (result.status !== 'granted') {
            Alert.alert('Camera permission is required');
            return;
        }

        const pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!pickerResult.canceled) {
            setImage(pickerResult.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        if (!location || !image) {
            Alert.alert(t('error'), t('please_complete_all_steps'));
            return;
        }

        setLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            const attendanceRecord: AttendanceRecord = {
                id: Math.random().toString(36).substr(2, 9),
                dealId: dealId,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString(),
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    address: address
                },
                imageUrl: image,
                status: 'pending'
            };

            dispatch(addAttendance({ dealId, record: attendanceRecord }));
            setLoading(false);
            Alert.alert(t('success'), t('attendance_submitted'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('mark_attendance')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Step 1: Location */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.stepBadge, location ? styles.stepActive : {}]}>
                            <Text style={styles.stepText}>1</Text>
                        </View>
                        <Text style={styles.sectionTitle}>{t('verify_location')}</Text>
                    </View>

                    <View style={styles.card}>
                        {verifying ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : location ? (
                            <View style={styles.verifiedContainer}>
                                <AppIcon name="checkmark-circle" size={32} color={Colors.success} />
                                <View style={styles.locationInfo}>
                                    <Text style={styles.coords}>
                                        {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                                    </Text>
                                    <Text style={styles.address}>{address || t('location_verified')}</Text>
                                    <Text style={styles.timestamp}>{new Date().toLocaleTimeString()}</Text>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.actionBtn} onPress={verifyLocation}>
                                <AppIcon name="location" size={20} color={Colors.white} />
                                <Text style={styles.btnText}>{t('get_gps_location')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Step 2: Selfie */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.stepBadge, image ? styles.stepActive : {}]}>
                            <Text style={styles.stepText}>2</Text>
                        </View>
                        <Text style={styles.sectionTitle}>{t('upload_photo')}</Text>
                    </View>

                    <View style={styles.card}>
                        {image ? (
                            <View>
                                <Image source={{ uri: image }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.retakeBtn} onPress={takePicture}>
                                    <Text style={styles.retakeText}>{t('retake_photo')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.cameraPlaceholder} onPress={takePicture}>
                                <AppIcon name="camera" size={40} color={Colors.textSecondary} />
                                <Text style={styles.placeholderText}>{t('take_selfie_site')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Warning */}
                <View style={styles.warningBox}>
                    <AppIcon name="information-circle" size={20} color={Colors.warning} />
                    <Text style={styles.warningText}>
                        {t('attendance_warning_rule')}
                    </Text>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, (!location || !image) && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={!location || !image || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitText}>{t('submit_attendance')}</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    content: {
        padding: spacing.l,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.s,
    },
    stepActive: {
        backgroundColor: Colors.success,
    },
    stepText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.l,
        elevation: 2,
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        gap: 8,
    },
    btnText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        width: '100%',
    },
    locationInfo: {
        flex: 1,
    },
    coords: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    address: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    timestamp: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    cameraPlaceholder: {
        width: '100%',
        height: 200,
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
    },
    placeholderText: {
        color: Colors.textSecondary,
        marginTop: 10,
        fontWeight: 'bold',
    },
    previewImage: {
        width: 300,
        height: 300,
        borderRadius: 12,
        marginBottom: 10,
    },
    retakeBtn: {
        alignItems: 'center',
        padding: 8,
    },
    retakeText: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        padding: spacing.m,
        borderRadius: 8,
        gap: 10,
        marginTop: spacing.m,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    footer: {
        padding: spacing.l,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderColor: Colors.border,
    },
    submitBtn: {
        backgroundColor: Colors.success,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
    },
    disabledBtn: {
        backgroundColor: Colors.textSecondary,
        elevation: 0,
    },
    submitText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    }
});

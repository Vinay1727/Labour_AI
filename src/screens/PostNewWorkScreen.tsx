import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from '../components/common/AppButton';
import { useTranslation } from '../context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default function PostNewWorkScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [skilledCount, setSkilledCount] = useState(0);
    const [labourCount, setLabourCount] = useState(0);
    const [workSize, setWorkSize] = useState({ length: '', height: '' });
    const [images, setImages] = useState<string[]>([]);
    const [duration, setDuration] = useState('1 Day');
    const [location, setLocation] = useState<any>(null);
    const [payment, setPayment] = useState({ amount: '', type: 'Per Day' });
    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const workTypes = [
        { id: 'painter', label: t('painter'), icon: '🎨', needsSize: true, skilled: true },
        { id: 'mistri', label: t('mistri'), icon: '🧱', needsSize: true, skilled: true },
        { id: 'helper', label: t('helper'), icon: '👷', needsSize: false, skilled: false },
        { id: 'electrician', label: t('electrician'), icon: '⚡', needsSize: false, skilled: true },
        { id: 'plumber', label: t('plumber'), icon: '🚰', needsSize: false, skilled: true },
    ];

    const durations = [
        { id: '1_day', label: '1 Day' },
        { id: 'multi_day', label: '2–5 Days' },
        { id: 'contract', label: 'Contract' }
    ];

    const paymentTypes = ['Per Day', 'Fixed/Contract'];

    const showSizeFields = selectedTypes.some(id =>
        workTypes.find(w => w.id === id)?.needsSize
    );

    const isSkilledWorkSelected = selectedTypes.some(id =>
        workTypes.find(w => w.id === id)?.skilled
    );

    const toggleWorkType = (id: string) => {
        if (selectedTypes.includes(id)) {
            setSelectedTypes(selectedTypes.filter(t => t !== id));
        } else {
            setSelectedTypes([...selectedTypes, id]);
        }
    };

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const detectLocation = async () => {
        setIsDetectingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                setIsDetectingLocation(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            let reverse = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });

            if (reverse.length > 0) {
                const addr = reverse[0];
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    address: `${addr.street || ''} ${addr.city || addr.subregion}, ${addr.region}`
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Could not detect location');
        } finally {
            setIsDetectingLocation(false);
        }
    };

    useEffect(() => {
        detectLocation();
    }, []);

    const isFormValid = () => {
        if (selectedTypes.length === 0) return false;
        if (isSkilledWorkSelected && skilledCount === 0) return false;
        if (!isSkilledWorkSelected && labourCount === 0) return false;
        if (skilledCount === 0 && labourCount === 0) return false;
        return true;
    };

    const handlePostWork = () => {
        setIsLoading(true);

        const payload = {
            workType: selectedTypes,
            skilledCount,
            labourCount,
            workSize: showSizeFields ? {
                length: parseFloat(workSize.length) || null,
                height: parseFloat(workSize.height) || null
            } : null,
            images,
            duration: durations.find(d => d.label === duration)?.id || '1_day',
            location: location,
            payment: {
                amount: parseFloat(payment.amount) || null,
                type: payment.type
            }
        };

        console.log('Post Work Payload:', payload);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigation.goBack();
        }, 1500);
    };

    const Stepper = ({ label, subLabel, value, onChange, max = 20 }: any) => (
        <View style={styles.stepperSection}>
            <View style={styles.stepperInfo}>
                <Text style={styles.stepperLabel}>{label}</Text>
                <Text style={styles.stepperSubLabel}>{subLabel}</Text>
            </View>
            <View style={styles.stepperControls}>
                <TouchableOpacity
                    style={[styles.stepperBtn, value === 0 && styles.stepperBtnDisabled]}
                    onPress={() => onChange(Math.max(0, value - 1))}
                    disabled={value === 0}
                >
                    <AppIcon name="remove" size={20} color={value === 0 ? Colors.textDisabled : Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{value}</Text>
                <TouchableOpacity
                    style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
                    onPress={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                >
                    <AppIcon name="add" size={20} color={value >= max ? Colors.textDisabled : Colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>{t('post_new_work')}</Text>
                        <Text style={styles.headerSubtitle}>{t('tell_us_what_work')}</Text>
                    </View>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Work Type */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('select_work_type')}</Text>
                        <View style={styles.workTypeGrid}>
                            {workTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeCard,
                                        selectedTypes.includes(type.id) && styles.selectedTypeCard
                                    ]}
                                    onPress={() => toggleWorkType(type.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.typeIcon}>{type.icon}</Text>
                                    <Text style={[
                                        styles.typeLabel,
                                        selectedTypes.includes(type.id) && styles.selectedTypeLabel
                                    ]}>{type.label}</Text>
                                    {selectedTypes.includes(type.id) && (
                                        <View style={styles.checkBadge}>
                                            <AppIcon name="checkmark-circle" size={20} color={Colors.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Labour Counts */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('work_requirements')}</Text>
                        <View style={styles.card}>
                            <Stepper
                                label={t('skilled_workers')}
                                subLabel={t('skilled_desc')}
                                value={skilledCount}
                                onChange={setSkilledCount}
                            />
                            <View style={styles.divider} />
                            <Stepper
                                label={t('general_labour')}
                                subLabel={t('labour_desc')}
                                value={labourCount}
                                onChange={setLabourCount}
                            />
                            {skilledCount === 0 && labourCount === 0 && (
                                <View style={styles.warningBox}>
                                    <AppIcon name="warning-outline" size={16} color={Colors.warning} />
                                    <Text style={styles.warningText}>{t('please_add_worker')}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Work Size Measurements */}
                    {showSizeFields && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('work_size')}</Text>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                                    <Text style={styles.inputLabel}>{t('length')} ({t('ft')})</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={workSize.length}
                                        onChangeText={(val) => setWorkSize({ ...workSize, length: val })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                                    <Text style={styles.inputLabel}>{t('height')} ({t('ft')})</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={workSize.height}
                                        onChangeText={(val) => setWorkSize({ ...workSize, height: val })}
                                    />
                                </View>
                            </View>
                            <Text style={styles.helperText}>Helps labour understand work scale</Text>
                        </View>
                    )}

                    {/* Images Upload */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('upload_images')}</Text>
                        <View style={styles.imageContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {images.map((uri, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <TouchableOpacity
                                            style={styles.removeImageBtn}
                                            onPress={() => removeImage(index)}
                                        >
                                            <AppIcon name="close-circle" size={24} color={Colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {images.length < 5 && (
                                    <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                                        <AppIcon name="camera-outline" size={32} color={Colors.primary} />
                                        <Text style={styles.addImageText}>{t('add_photo')}</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </View>
                        <Text style={styles.helperText}>Upload 1–5 images to explain work better</Text>
                    </View>

                    {/* Duration */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('work_duration')}</Text>
                        <View style={styles.durationGrid}>
                            {durations.map((d) => (
                                <TouchableOpacity
                                    key={d.id}
                                    style={[
                                        styles.durationChip,
                                        duration === d.label && styles.selectedDurationChip
                                    ]}
                                    onPress={() => setDuration(d.label)}
                                >
                                    <Text style={[
                                        styles.durationChipText,
                                        duration === d.label && styles.selectedDurationChipText
                                    ]}>{d.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('work_location')}</Text>
                        <TouchableOpacity
                            style={styles.locationCard}
                            onPress={detectLocation}
                            disabled={isDetectingLocation}
                        >
                            <View style={styles.locationIcon}>
                                {isDetectingLocation ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : (
                                    <AppIcon name="location" size={24} color={Colors.primary} />
                                )}
                            </View>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationText} numberOfLines={2}>
                                    {location ? location.address : 'Detecting current location...'}
                                </Text>
                                <Text style={styles.locationLink}>{t('edit_area')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>


                    {/* Payment */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('approx_payment')} (Optional)</Text>
                        <View style={styles.paymentContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Amount (₹)"
                                keyboardType="numeric"
                                value={payment.amount}
                                onChangeText={(val) => setPayment({ ...payment, amount: val })}
                            />
                            <View style={styles.paymentTypeTabs}>
                                {paymentTypes.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.paymentTab,
                                            payment.type === type && styles.selectedPaymentTab
                                        ]}
                                        onPress={() => setPayment({ ...payment, type })}
                                    >
                                        <Text style={[
                                            styles.paymentTabText,
                                            payment.type === type && styles.selectedPaymentTabText
                                        ]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <AppButton
                        title={t('post_work')}
                        onPress={handlePostWork}
                        disabled={!isFormValid()}
                        loading={isLoading}
                    />
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        padding: spacing.xs,
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.screenPadding,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: spacing.md,
    },
    workTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    typeCard: {
        width: '47%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.border,
        position: 'relative',
    },
    selectedTypeCard: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    typeIcon: {
        fontSize: 32,
        marginBottom: spacing.xs,
    },
    typeLabel: {
        fontSize: 14,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    selectedTypeLabel: {
        color: Colors.primary,
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    stepperSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    stepperInfo: {
        flex: 1,
    },
    stepperLabel: {
        fontSize: 15,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
    },
    stepperSubLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.textInput,
        borderRadius: 12,
        padding: 4,
    },
    stepperBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    stepperBtnDisabled: {
        backgroundColor: Colors.border,
        elevation: 0,
    },
    stepperValue: {
        paddingHorizontal: spacing.md,
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        minWidth: 40,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: spacing.md,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: spacing.sm,
        borderRadius: 8,
        marginTop: spacing.md,
    },
    warningText: {
        fontSize: 12,
        color: Colors.warning,
        marginLeft: spacing.xs,
        fontWeight: typography.weight.medium,
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: spacing.xs,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: typography.weight.medium,
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    helperText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    imageContainer: {
        marginTop: spacing.xs,
    },
    imageWrapper: {
        marginRight: spacing.md,
        position: 'relative',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: Colors.white,
        borderRadius: 12,
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
    },
    addImageText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: typography.weight.bold,
        marginTop: 4,
    },
    durationGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    durationChip: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    selectedDurationChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    durationChipText: {
        color: Colors.textSecondary,
        fontWeight: typography.weight.bold,
    },
    selectedDurationChipText: {
        color: Colors.white,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    locationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    locationText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: typography.weight.medium,
    },
    locationLink: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: typography.weight.bold,
        marginTop: 2,
    },
    paymentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    paymentTypeTabs: {
        flexDirection: 'row',
        backgroundColor: Colors.textInput,
        borderRadius: 12,
        padding: 4,
    },
    paymentTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectedPaymentTab: {
        backgroundColor: Colors.white,
        elevation: 1,
    },
    paymentTabText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: typography.weight.medium,
    },
    selectedPaymentTabText: {
        color: Colors.primary,
        fontWeight: typography.weight.bold,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.screenPadding,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
});


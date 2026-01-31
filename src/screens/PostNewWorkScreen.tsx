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
import api from '../services/api';

interface SkillRequirement {
    id: string;
    count: number;
    payment: {
        amount: string;
        type: 'per_day' | 'fixed';
    };
}

export default function PostNewWorkScreen({ navigation, route }: any) {
    const jobData = route.params?.jobData;
    const isEditMode = !!jobData;
    const { t } = useTranslation();
    const [selectedSkills, setSelectedSkills] = useState<SkillRequirement[]>([]);
    const [workSize, setWorkSize] = useState({ length: '', height: '' });
    const [images, setImages] = useState<string[]>([]);
    const [durationLabel, setDurationLabel] = useState('1 Day');
    const [customDays, setCustomDays] = useState('');
    const [location, setLocation] = useState<any>(null);
    const [additionalRequirements, setAdditionalRequirements] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const workTypes = [
        { id: 'painter', label: t('painter'), icon: '🎨', needsSize: true, skilled: true },
        { id: 'mistri', label: t('mistri'), icon: '🧱', needsSize: true, skilled: true },
        { id: 'helper', label: t('helper'), icon: '👷', needsSize: false, skilled: false },
        { id: 'electrician', label: t('electrician'), icon: '⚡', needsSize: false, skilled: true },
        { id: 'plumber', label: t('plumber'), icon: '🚰', needsSize: false, skilled: true },
        { id: 'carpenter', label: t('carpenter'), icon: '🪚', needsSize: false, skilled: true },
        { id: 'welder', label: t('welder'), icon: '👨‍🏭', needsSize: false, skilled: true },
        { id: 'tile_mason', label: t('tile_mason'), icon: '📐', needsSize: true, skilled: true },
        { id: 'pop_false_ceiling', label: t('pop_false_ceiling'), icon: '🏗️', needsSize: true, skilled: true },
        { id: 'fabricator', label: t('fabricator'), icon: '🛠️', needsSize: false, skilled: true },
        { id: 'gardener', label: t('gardener'), icon: '🪴', needsSize: false, skilled: true },
        { id: 'deep_cleaning', label: t('deep_cleaning'), icon: '🧹', needsSize: false, skilled: true },
        { id: 'driver', label: t('driver'), icon: '🚗', needsSize: false, skilled: true },
        { id: 'cctv_tech', label: t('cctv_tech'), icon: '📹', needsSize: false, skilled: true },
        { id: 'ac_service', label: t('ac_service'), icon: '❄️', needsSize: false, skilled: true },
        { id: 'ro_service', label: t('ro_service'), icon: '💧', needsSize: false, skilled: true },
        { id: 'loading_unloading', label: t('loading_unloading'), icon: '📦', needsSize: false, skilled: false },
        { id: 'pest_control', label: t('pest_control'), icon: '🛡️', needsSize: false, skilled: true },
    ];

    const filteredWorkTypes = workTypes.filter(type =>
        type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const durations = [
        { id: '1_day', label: '1 Day', type: 'fixed' },
        { id: 'multi_day', label: '2–5 Days', type: 'fixed' },
        { id: 'contract', label: 'Contract', type: 'contract' },
        { id: 'custom', label: t('custom_days'), type: 'custom' }
    ];

    const paymentOptions = [
        { id: 'per_day', label: t('per_day') },
        { id: 'fixed', label: t('fixed_contract') }
    ];

    const isSkillSelected = (id: string) => selectedSkills.some(s => s.id === id);

    const toggleWorkType = (id: string) => {
        if (isSkillSelected(id)) {
            setSelectedSkills(selectedSkills.filter(s => s.id !== id));
        } else {
            setSelectedSkills([
                ...selectedSkills,
                { id, count: 1, payment: { amount: '', type: 'per_day' } }
            ]);
        }
    };

    const updateSkillData = (id: string, updates: Partial<SkillRequirement>) => {
        setSelectedSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const updateSkillPayment = (id: string, updates: Partial<SkillRequirement['payment']>) => {
        setSelectedSkills(prev => prev.map(s =>
            s.id === id ? { ...s, payment: { ...s.payment, ...updates } } : s
        ));
    };

    const showSizeFields = selectedSkills.some(s =>
        workTypes.find(w => w.id === s.id)?.needsSize
    );

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert(t('limit_reached' as any), t('images_limit_msg' as any));
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
                Alert.alert(t('permission_denied' as any), t('location_permission_msg' as any));
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
            Alert.alert(t('error'), t('location_permission_msg' as any));
        } finally {
            setIsDetectingLocation(false);
        }
    };

    useEffect(() => {
        if (isEditMode) {
            // Pre-fill fields
            if (jobData.skills) {
                setSelectedSkills(jobData.skills.map((s: any) => ({
                    id: s.skillType,
                    count: s.requiredCount,
                    payment: {
                        amount: s.payment?.amount?.toString() || '',
                        type: s.payment?.type || 'per_day'
                    }
                })));
            }
            if (jobData.workSize) {
                setWorkSize({
                    length: jobData.workSize.length?.toString() || '',
                    height: jobData.workSize.height?.toString() || ''
                });
            }
            if (jobData.duration) {
                setDurationLabel(jobData.duration);
            }
            if (jobData.description) {
                setAdditionalRequirements(jobData.description);
            }
            if (jobData.location) {
                setLocation({
                    latitude: jobData.location.coordinates[1],
                    longitude: jobData.location.coordinates[0],
                    address: jobData.location.address
                });
            }
            if (jobData.images) {
                // For images, we might need to handle URLs vs local URIs
                // But for now let's just show them if they are local or handle remote later
                // images are likely URLs now.
                setImages(jobData.images);
            }
        } else {
            detectLocation();
        }
    }, [isEditMode, jobData]);

    const isFormValid = () => {
        // Must select at least one skill
        if (selectedSkills.length === 0) return false;

        // Every skill must have a valid count and a price
        const skillsValid = selectedSkills.every(s =>
            s.count >= 1 &&
            s.payment.amount.trim() !== '' &&
            parseFloat(s.payment.amount) > 0
        );
        if (!skillsValid) return false;

        // Custom duration validation
        if (durationLabel === t('custom_days') && (!customDays || parseInt(customDays) < 1)) return false;

        // General duration selection (it defaults to '1 Day', so it's usually valid)
        if (!durationLabel) return false;

        return true;
    };


    const handlePostWork = async () => {
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Basic fields
            formData.append('workType', selectedSkills[0].id);
            formData.append('requiredWorkers', selectedSkills.reduce((acc, curr) => acc + curr.count, 0).toString());
            formData.append('paymentAmount', (selectedSkills[0].payment.amount || '0').toString());
            formData.append('paymentType', selectedSkills[0].payment.type);
            formData.append('duration', durationLabel === t('custom_days') ? `${customDays} Days` : durationLabel);
            formData.append('description', additionalRequirements);
            formData.append('status', 'open');

            // Complex objects need stringifying for FormData
            formData.append('skills', JSON.stringify(selectedSkills.map(s => ({
                skillType: s.id,
                requiredCount: s.count,
                payment: {
                    amount: parseFloat(s.payment.amount) || null,
                    type: s.payment.type || null
                }
            }))));

            if (showSizeFields) {
                formData.append('workSize', JSON.stringify({
                    length: parseFloat(workSize.length) || null,
                    height: parseFloat(workSize.height) || null
                }));
            }

            if (location) {
                formData.append('location', JSON.stringify({
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude],
                    address: location.address
                }));
            }

            // Append new local images only
            images.forEach((uri, index) => {
                if (!uri.startsWith('file://') && !uri.startsWith('content://')) return; // Skip remote URLs

                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('images', {
                    uri,
                    name: filename || `image_${index}.jpg`,
                    type,
                } as any);
            });

            console.log('Sending Post Work FormData');
            const url = isEditMode ? `jobs/${jobData._id}` : 'jobs';
            const method = isEditMode ? 'put' : 'post';

            const response = await api[method](url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Post Work Response:', response.data);
            Alert.alert(t('success'), isEditMode ? t('work_updated_success' as any) : t('work_posted_success' as any));
            navigation.goBack();
        } catch (error: any) {
            console.error('Post Work Error:', error.response?.data || error.message);
            Alert.alert(t('error'), error.response?.data?.message || 'Failed to post work');
        } finally {
            setIsLoading(false);
        }
    };

    const Stepper = ({ value, onChange, max = 20 }: any) => (
        <View style={styles.stepperControls}>
            <TouchableOpacity
                style={[styles.stepperBtn, value === 1 && styles.stepperBtnDisabled]}
                onPress={() => onChange(Math.max(1, value - 1))}
                disabled={value === 1}
            >
                <AppIcon name="remove" size={20} color={value === 1 ? Colors.textDisabled : Colors.textPrimary} />
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
                        <Text style={styles.headerTitle}>{isEditMode ? t('edit_work' as any) : t('post_new_work')}</Text>
                        <Text style={styles.headerSubtitle}>{isEditMode ? t('update_job_details' as any) : t('tell_us_what_work')}</Text>
                    </View>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Work Type Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>{t('select_work_type')}</Text>
                            {selectedSkills.length > 0 && (
                                <Text style={styles.selectedCountText}>{selectedSkills.length} {t('applied')}</Text>
                            )}
                        </View>

                        <View style={styles.searchContainer}>
                            <AppIcon name="search-outline" size={20} color={Colors.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('search_skills_placeholder' as any)}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <AppIcon name="close-circle" size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {searchQuery.length > 0 ? (
                            <View style={styles.workTypeGrid}>
                                {filteredWorkTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeCard,
                                            isSkillSelected(type.id) && styles.selectedTypeCard
                                        ]}
                                        onPress={() => toggleWorkType(type.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.typeIconContainer}>
                                            <Text style={styles.typeIcon}>{type.icon}</Text>
                                        </View>
                                        <Text style={[
                                            styles.typeLabel,
                                            isSkillSelected(type.id) && styles.selectedTypeLabel
                                        ]} numberOfLines={1}>{type.label}</Text>
                                        {isSkillSelected(type.id) && (
                                            <View style={styles.checkBadge}>
                                                <AppIcon name="checkmark-circle" size={18} color={Colors.primary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                                {filteredWorkTypes.length === 0 && (
                                    <View style={styles.noResultContainer}>
                                        <Text style={styles.noResultText}>{t('no_skills_found' as any)} for "{searchQuery}"</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.infoHintContainer}>
                                <AppIcon name="information-circle-outline" size={20} color={Colors.textSecondary} />
                                <Text style={styles.infoHintText}>Search for any work or skill you need (Painter, Mistri, etc.)</Text>
                            </View>
                        )}

                    </View>

                    {/* Skill-Specific details */}
                    {selectedSkills.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('requirements_per_skill')}</Text>
                            <Text style={styles.sectionSubtitle}>{t('per_skill_details')}</Text>

                            {selectedSkills.map(skill => {
                                const typeInfo = workTypes.find(w => w.id === skill.id);
                                return (
                                    <View key={skill.id} style={styles.skillRowCard}>
                                        <View style={styles.skillRowHeader}>
                                            <View style={styles.skillIconBadge}>
                                                <Text style={styles.skillIconText}>{typeInfo?.icon}</Text>
                                            </View>
                                            <Text style={styles.skillLabelText}>{typeInfo?.label}</Text>
                                        </View>

                                        {/* Required Workers Section */}
                                        <View style={styles.skillSection}>
                                            <Text style={styles.configLabel}>{t('required_workers' as any)}</Text>
                                            <Stepper
                                                value={skill.count}
                                                onChange={(val: number) => updateSkillData(skill.id, { count: val })}
                                            />
                                        </View>

                                        <View style={styles.inlineDivider} />

                                        {/* Payment Section */}
                                        <View style={styles.skillSection}>
                                            <Text style={styles.configLabel}>{t('approx_payment_label')}</Text>
                                            <View style={styles.skillPaymentContainer}>
                                                <View style={styles.fullWidthInputWrapper}>
                                                    <Text style={styles.skillCurrencyPrefix}>₹</Text>
                                                    <TextInput
                                                        style={styles.skillPaymentInputFull}
                                                        placeholder={t('payment_amount_placeholder')}
                                                        keyboardType="numeric"
                                                        value={skill.payment.amount}
                                                        onChangeText={(val) => updateSkillPayment(skill.id, { amount: val })}
                                                    />
                                                </View>

                                                <View style={styles.skillPaymentOptionsRow}>
                                                    {paymentOptions.map(opt => (
                                                        <TouchableOpacity
                                                            key={opt.id}
                                                            style={styles.paymentRadioOption}
                                                            onPress={() => updateSkillPayment(skill.id, { type: opt.id as any })}
                                                        >
                                                            <View style={[
                                                                styles.miniRadio,
                                                                skill.payment.type === opt.id && styles.miniRadioActive
                                                            ]}>
                                                                {skill.payment.type === opt.id && <View style={styles.miniRadioDot} />}
                                                            </View>
                                                            <Text style={[
                                                                styles.miniRadioLabel,
                                                                skill.payment.type === opt.id && styles.miniRadioLabelActive
                                                            ]}>{opt.label}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Additional Requirements */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('additional_requirements_label')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={t('additional_requirements_placeholder')}
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            maxLength={300}
                            value={additionalRequirements}
                            onChangeText={setAdditionalRequirements}
                        />
                        <View style={styles.textAreaFooter}>
                            <Text style={styles.helperText}>{t('additional_requirements_helper')}</Text>
                            <Text style={styles.charCount}>{additionalRequirements.length}/300</Text>
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
                                        durationLabel === d.label && styles.selectedDurationChip
                                    ]}
                                    onPress={() => setDurationLabel(d.label)}
                                >
                                    <Text style={[
                                        styles.durationChipText,
                                        durationLabel === d.label && styles.selectedDurationChipText
                                    ]}>{d.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {durationLabel === t('custom_days') && (
                            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
                                <Text style={styles.inputLabel}>{t('enter_days')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 10"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={customDays}
                                    onChangeText={setCustomDays}
                                />
                            </View>
                        )}
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
                                    {location ? location.address : t('detecting_location' as any)}
                                </Text>
                                <Text style={styles.locationLink}>{t('edit_area')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                <View style={styles.footer}>
                    <AppButton
                        title={isEditMode ? t('update_details' as any) : t('post_work')}
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
        fontFamily: 'serif',
        textTransform: 'uppercase',
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
    },
    sectionSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: spacing.md,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    selectedCountText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: typography.weight.bold,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: 15,
        color: Colors.textPrimary,
    },
    workTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    typeCard: {
        width: '31.5%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: spacing.sm,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.border,
        position: 'relative',
        marginBottom: spacing.xs,
    },
    selectedTypeCard: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    typeIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIcon: {
        fontSize: 24,
    },
    typeLabel: {
        fontSize: 11,
        fontWeight: typography.weight.bold,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    selectedTypeLabel: {
        color: Colors.primary,
    },
    checkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    noResultContainer: {
        width: '100%',
        padding: spacing.xl,
        alignItems: 'center',
    },
    noResultText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontStyle: 'italic',
    },
    skillRowCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    skillRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    skillIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    skillIconText: {
        fontSize: 20,
    },
    skillLabelText: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        textTransform: 'capitalize',
    },
    skillSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    configLabel: {
        fontSize: 14,
        fontWeight: typography.weight.semiBold,
        color: Colors.textSecondary,
    },
    inlineDivider: {
        height: 1,
        backgroundColor: Colors.border,
        opacity: 0.5,
    },
    skillPaymentContainer: {
        flex: 1,
        marginLeft: spacing.lg,
    },
    fullWidthInputWrapper: {
        position: 'relative',
        marginBottom: spacing.sm,
    },
    skillCurrencyPrefix: {
        position: 'absolute',
        left: 12,
        top: 11,
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        zIndex: 1,
    },
    skillPaymentInputFull: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingLeft: 28,
        paddingRight: spacing.md,
        paddingVertical: 10,
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.border,
        width: '100%',
    },
    skillPaymentOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: spacing.md,
    },
    paymentRadioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    miniRadio: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    miniRadioActive: {
        borderColor: Colors.primary,
    },
    miniRadioDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    miniRadioLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    miniRadioLabelActive: {
        color: Colors.primary,
        fontWeight: typography.weight.bold,
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.textInput,
        borderRadius: 12,
        padding: 4,
    },
    stepperBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
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
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        minWidth: 36,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: spacing.xs,
        position: 'relative',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: spacing.md,
    },
    textAreaFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    charCount: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    helperText: {
        fontSize: 12,
        color: Colors.textSecondary,
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
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    durationChip: {
        width: '48%',
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
    infoHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    infoHintText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: spacing.sm,
        flex: 1,
        fontStyle: 'italic',
    },
});



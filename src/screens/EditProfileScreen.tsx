import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { AppButton } from '../components/common/AppButton';
import { useTranslation } from '../context/LanguageContext';

export default function EditProfileScreen({ navigation }: any) {
    const { user, role, updateProfile, requestPhoneChange, verifyPhoneChange } = useAuth();
    const { t } = useTranslation();
    const isLabour = role === 'labour';

    const [loading, setLoading] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        location: typeof user?.location === 'object' ? `${user.location.area}, ${user.location.city}` : user?.location || '',
        skills: user?.skills || [],
        isSkilled: user?.isSkilled ?? false,
        experience: user?.experience?.toString() || '',
        workType: user?.workType || 'Daily',
        availability: user?.availability || 'Available',
        businessType: user?.businessType || '',
    });

    const hasChanges = () => {
        if (!user) return true;
        const currentLocationStr = typeof user.location === 'object' ? `${user.location.area}, ${user.location.city}` : user.location;
        return (
            formData.name !== user.name ||
            formData.location !== currentLocationStr ||
            JSON.stringify(formData.skills) !== JSON.stringify(user.skills || []) ||
            formData.isSkilled !== user.isSkilled ||
            formData.experience !== user.experience?.toString() ||
            formData.workType !== user.workType ||
            formData.availability !== user.availability ||
            formData.businessType !== user.businessType
        );
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert(t('details'), t('enter_name'));
            return;
        }

        setLoading(true);
        try {
            // Mock API update
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (updateProfile) {
                const parts = formData.location.split(',');
                const locationObj = {
                    area: parts[0]?.trim() || 'Noida',
                    city: parts[1]?.trim() || 'Noida'
                };
                await updateProfile({
                    ...formData,
                    location: locationObj
                } as any);
            }

            Alert.alert(t('success'), t('profile_updated_success' as any), [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert(t('error'), t('failed_to_update_profile' as any));
        } finally {
            setLoading(false);
        }
    };

    const handleInitiatePhoneChange = async () => {
        if (newPhone.length < 10) {
            Alert.alert("Invalid Phone", "Please enter a valid 10-digit number");
            return;
        }

        if (newPhone === user?.phone) {
            Alert.alert("Old Phone", "This is already your current mobile number");
            return;
        }

        setLoading(true);
        try {
            const res = await requestPhoneChange(newPhone);
            setShowOtpModal(true);
            // In dev mode, OTP is 1234
            Alert.alert("OTP Sent", `${t('enter_4_digit_code' as any)} ${newPhone}.\n(Use 1234 for testing)`);
        } catch (error: any) {
            Alert.alert(t('error'), error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            Alert.alert("Invalid OTP", "Please enter 4-digit code");
            return;
        }

        setVerifying(true);
        try {
            await verifyPhoneChange(otp);
            setShowOtpModal(false);
            setOtp('');
            setNewPhone('');
            Alert.alert("Success", "Mobile number updated successfully!");
        } catch (error: any) {
            Alert.alert("Verification Failed", error);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('edit_profile')}</Text>
                <TouchableOpacity onPress={handleSave} disabled={!hasChanges() || loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Text style={[styles.saveText, (!hasChanges() || loading) && { opacity: 0.5 }]}>{t('save')}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* Common Fields */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>{t('personal_info')}</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('full_name')}</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(val) => setFormData({ ...formData, name: val })}
                                placeholder={t('enter_name')}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('phone_fixed')}</Text>
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledInputText}>{user?.phone || '+91'}</Text>
                                <AppIcon name="lock-closed" size={16} color={Colors.textSecondary} />
                            </View>
                            <Text style={styles.helperText}>{t('phone_change_helper' as any)}</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('new_mobile_number' as any)}</Text>
                            <View style={styles.phoneInputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={newPhone}
                                    onChangeText={setNewPhone}
                                    placeholder={t('enter_new_mobile' as any)}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                                <TouchableOpacity
                                    style={[styles.changeBtn, (!newPhone || newPhone.length < 10) && styles.disabledBtn]}
                                    onPress={handleInitiatePhoneChange}
                                    disabled={!newPhone || newPhone.length < 10 || loading}
                                >
                                    <Text style={styles.changeBtnText}>{t('change' as any)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('location_area')}</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.location}
                                onChangeText={(val) => setFormData({ ...formData, location: val })}
                                placeholder="e.g. Sector 62, Noida"
                            />
                        </View>
                    </View>

                    {/* Labour Specific Fields */}
                    {isLabour && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>{t('work_skills')}</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t('primary_skill')}</Text>
                                <TextInput
                                    style={[styles.input, styles.disabledInput]}
                                    value={formData.skills.join(', ')}
                                    editable={false}
                                    placeholder="e.g. Painter, Mistri"
                                />
                                <Text style={styles.helperText}>Skills can be changed via onboarding flow (Coming soon in Edit)</Text>

                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t('exp_years_label')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.experience}
                                    onChangeText={(val) => setFormData({ ...formData, experience: val })}
                                    keyboardType="numeric"
                                    placeholder="e.g. 5"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t('availability')}</Text>
                                <View style={styles.chipRow}>
                                    {[
                                        { id: 'Available', label: t('available') },
                                        { id: 'Busy', label: t('busy') },
                                        { id: 'On Leave', label: t('on_leave') }
                                    ].map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.chip, formData.availability === item.id && styles.activeChip]}
                                            onPress={() => setFormData({ ...formData, availability: item.id })}
                                        >
                                            <Text style={[styles.chipText, formData.availability === item.id && styles.activeChipText]}>{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Contractor Specific Fields */}
                    {!isLabour && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>{t('business_details')}</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t('business_work_type')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.businessType}
                                    onChangeText={(val) => setFormData({ ...formData, businessType: val })}
                                    placeholder="e.g. Residential Construction"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.footerAction}>
                        <AppButton
                            title={t('update_profile')}
                            onPress={handleSave}
                            loading={loading}
                            disabled={!hasChanges()}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* OTP Verification Modal */}
            <Modal
                visible={showOtpModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowOtpModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('verify_new_number' as any)}</Text>
                        <Text style={styles.modalSubTitle}>{t('enter_4_digit_code' as any)} {newPhone}</Text>

                        <TextInput
                            style={styles.otpInput}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={4}
                            placeholder="X X X X"
                            autoFocus
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setShowOtpModal(false);
                                    setOtp('');
                                }}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.verifyBtn, otp.length < 4 && styles.disabledBtn]}
                                onPress={handleVerifyOtp}
                                disabled={otp.length < 4 || verifying}
                            >
                                {verifying ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.verifyBtnText}>{t('verify_and_update' as any)}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    saveText: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
        paddingHorizontal: 8,
    },
    scrollContent: {
        padding: spacing.l,
    },
    helperText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: typography.weight.bold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    disabledInput: {
        backgroundColor: Colors.textInput,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    disabledInputText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    activeChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    activeChipText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    footerAction: {
        marginTop: spacing.xl,
        paddingBottom: 40,
    },
    phoneInputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    changeBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    modalSubTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    otpInput: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 10,
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        width: 200,
        textAlign: 'center',
        marginBottom: 32,
        color: Colors.textPrimary,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    verifyBtn: {
        flex: 2,
        backgroundColor: Colors.success || '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    verifyBtnText: {
        color: Colors.white,
        fontWeight: 'bold',
    }
});

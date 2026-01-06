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
    ActivityIndicator
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
    const { user, role, updateProfile } = useAuth();
    const { t } = useTranslation();
    const isLabour = role === 'labour';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        location: typeof user?.location === 'object' ? `${user.location.area}, ${user.location.city}` : user?.location || '',
        skill: user?.skill || '',
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
            formData.skill !== user.skill ||
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

            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
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
                                <Text style={styles.disabledInputText}>{user?.phone || '+91 9876543210'}</Text>
                                <AppIcon name="lock-closed" size={16} color={Colors.textSecondary} />
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
                                    style={styles.input}
                                    value={formData.skill}
                                    onChangeText={(val) => setFormData({ ...formData, skill: val })}
                                    placeholder="e.g. Painter, Mistri"
                                />
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
    }
});

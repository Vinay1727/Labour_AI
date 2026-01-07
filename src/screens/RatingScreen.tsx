import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
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
import { AppButton } from '../components/common/AppButton';
import { useTranslation } from '../context/LanguageContext';
import api from '../services/api';

export default function RatingScreen({ route, navigation }: any) {
    const { t } = useTranslation();
    const { dealId, ratedUserId, name } = route.params || {};
    const [stars, setStars] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const RATING_LABELS: Record<number, string> = {
        1: t('very_bad'),
        2: t('bad'),
        3: t('okay'),
        4: t('good'),
        5: t('excellent')
    };

    const handleSubmit = async () => {
        if (stars === 0) {
            Alert.alert(t('selection_required'), t('please_rate'));
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('reviews', {
                dealId,
                reviewedUserId: ratedUserId,
                rating: stars,
                comment: review
            });

            if (res.data.success) {
                Alert.alert(
                    t('thank_you'),
                    t('rating_submitted'),
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="close-circle" size={28} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('rate_experience')}</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.profileSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{name?.charAt(0) || 'U'}</Text>
                        </View>
                        <Text style={styles.nameText}>{name}</Text>
                        <Text style={styles.subText}>{t('rate_experience_with')} {name}?</Text>
                    </View>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <TouchableOpacity
                                key={num}
                                onPress={() => setStars(num)}
                                activeOpacity={0.7}
                                style={styles.starBox}
                            >
                                <AppIcon
                                    name={stars >= num ? "star" : "star-outline"}
                                    size={44}
                                    color={stars >= num ? "#F59E0B" : Colors.border}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {stars > 0 && (
                        <Text style={[styles.ratingLabel, { color: stars >= 4 ? Colors.success : stars <= 2 ? Colors.error : Colors.warning }]}>
                            {RATING_LABELS[stars]}
                        </Text>
                    )}

                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>{t('write_review')}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Tell us more about the work quality, behavior, etc."
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            value={review}
                            onChangeText={setReview}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.footer}>
                        <AppButton
                            title={t('submit_rating')}
                            onPress={handleSubmit}
                            loading={submitting}
                            disabled={stars === 0}
                        />
                        <Text style={styles.lockNote}>
                            <AppIcon name="lock-closed" size={12} /> {t('rating_lock_note')}
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
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
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
    },
    nameText: {
        fontSize: 22,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: spacing.md,
    },
    starBox: {
        padding: 4,
    },
    ratingLabel: {
        fontSize: 20,
        fontWeight: typography.weight.bold,
        marginBottom: spacing.xl,
    },
    inputSection: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: Colors.textInput,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: Colors.textPrimary,
        minHeight: 120,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    footer: {
        width: '100%',
        paddingBottom: 40,
    },
    lockNote: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
    },
});

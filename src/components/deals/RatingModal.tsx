import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTranslation } from '../../context/LanguageContext';
import { AppButton } from '../common/AppButton';

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    userName: string;
    role: 'contractor' | 'labour';
}

const FEEDBACK_OPTIONS = [
    { id: 1, label: 'Punctual', icon: 'time-outline' },
    { id: 2, label: 'Hard Working', icon: 'hammer-outline' },
    { id: 3, label: 'Skillful', icon: 'construct-outline' },
    { id: 4, label: 'Polite', icon: 'people-outline' },
];

export const RatingModal = ({ visible, onClose, onSubmit, userName, role }: RatingModalProps) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedChips, setSelectedChips] = useState<string[]>([]);

    const handleStarPress = (val: number) => {
        setRating(val);
    };

    const toggleChip = (label: string) => {
        if (selectedChips.includes(label)) {
            setSelectedChips(selectedChips.filter(c => c !== label));
        } else {
            setSelectedChips([...selectedChips, label]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert(t('please_rate'));
            return;
        }
        setSubmitting(true);
        try {
            const finalComment = selectedChips.length > 0
                ? `${selectedChips.join(', ')}. ${comment}`
                : comment;
            await onSubmit(rating, finalComment);
            onClose();
            // Reset
            setRating(0);
            setComment('');
            setSelectedChips([]);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('rate_experience')}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <AppIcon name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.body}>
                            <Text style={styles.subTitle}>
                                {t('rate_experience_with')} <Text style={styles.userName}>{userName}</Text>
                            </Text>

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => handleStarPress(star)}
                                        style={styles.star}
                                    >
                                        <AppIcon
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={40}
                                            color={star <= rating ? "#F59E0B" : Colors.border}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>{t('quick_feedback')}</Text>
                            <View style={styles.chipContainer}>
                                {FEEDBACK_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        style={[
                                            styles.chip,
                                            selectedChips.includes(opt.label) && styles.chipSelected
                                        ]}
                                        onPress={() => toggleChip(opt.label)}
                                    >
                                        <AppIcon
                                            name={opt.icon as any}
                                            size={14}
                                            color={selectedChips.includes(opt.label) ? Colors.white : Colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.chipText,
                                            selectedChips.includes(opt.label) && styles.chipTextSelected
                                        ]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>{t('optional')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('comment_placeholder')}
                                multiline
                                numberOfLines={3}
                                value={comment}
                                onChangeText={setComment}
                            />

                            <AppButton
                                title={t('submit_rating')}
                                onPress={handleSubmit}
                                loading={submitting}
                                style={styles.submitBtn}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: spacing.lg,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        paddingBottom: spacing.xl,
    },
    subTitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.l,
    },
    userName: {
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: spacing.xl,
    },
    star: {
        padding: 4,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: spacing.s,
        marginTop: spacing.md,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: spacing.md,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: '#F8FAFC',
    },
    chipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    chipTextSelected: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 14,
        color: Colors.textPrimary,
        textAlignVertical: 'top',
        minHeight: 100,
        backgroundColor: '#F8FAFC',
    },
    submitBtn: {
        marginTop: spacing.xl,
    },
});

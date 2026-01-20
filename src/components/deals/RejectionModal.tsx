import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AppIcon } from '../common/AppIcon';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useTranslation } from '../../context/LanguageContext';

interface RejectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reasons: string[], note: string) => void;
}

const PREDEFINED_REASONS = [
    'Kaam poora nahi hua',
    'Quality theek nahi hai',
    'Time par complete nahi hua',
    'Galat kaam hua',
    'Dobara kaam karna padega'
];

export const RejectionModal = ({ visible, onClose, onSubmit }: RejectionModalProps) => {
    const { t } = useTranslation();
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [note, setNote] = useState('');

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter(r => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleConfirm = () => {
        if (selectedReasons.length === 0) {
            alert('Kam se kam ek reason batayein');
            return;
        }
        onSubmit(selectedReasons, note);
        setSelectedReasons([]);
        setNote('');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Completion Kyun Reject Kar Rahe Hain?</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <AppIcon name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.content}>
                            <Text style={styles.subTitle}>Reason select karein (Zaroori):</Text>
                            <View style={styles.reasonsContainer}>
                                {PREDEFINED_REASONS.map((reason) => {
                                    const isSelected = selectedReasons.includes(reason);
                                    return (
                                        <TouchableOpacity
                                            key={reason}
                                            style={[styles.reasonChip, isSelected && styles.reasonChipSelected]}
                                            onPress={() => toggleReason(reason)}
                                        >
                                            <AppIcon
                                                name={isSelected ? "checkbox" : "square-outline"}
                                                size={18}
                                                color={isSelected ? Colors.white : Colors.textSecondary}
                                            />
                                            <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                                                {reason}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.subTitle}>Kuch aur likhna chahte hain? (Optional):</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Kuch aur feedback..."
                                placeholderTextColor={Colors.textLight}
                                multiline
                                numberOfLines={3}
                                value={note}
                                onChangeText={setNote}
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.submitBtn, selectedReasons.length === 0 && styles.submitBtnDisabled]}
                            onPress={handleConfirm}
                            disabled={selectedReasons.length === 0}
                        >
                            <Text style={styles.submitBtnText}>Reject Karein</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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
    keyboardView: {
        width: '100%',
    },
    container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: spacing.l,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 10,
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        marginBottom: 20,
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 10,
        marginTop: 10,
    },
    reasonsContainer: {
        gap: 10,
    },
    reasonChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    reasonChipSelected: {
        backgroundColor: Colors.error,
        borderColor: Colors.error,
    },
    reasonText: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    reasonTextSelected: {
        color: Colors.white,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        fontSize: 15,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    submitBtn: {
        backgroundColor: Colors.error,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    submitBtnDisabled: {
        backgroundColor: '#FDA4AF',
    },
    submitBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

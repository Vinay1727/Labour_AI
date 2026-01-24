import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { AppButton } from './AppButton';
import { AppIcon } from './AppIcon';

interface DeleteReasonModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    title?: string;
}

export const DeleteReasonModal: React.FC<DeleteReasonModalProps> = ({
    visible,
    onClose,
    onSubmit,
    title = 'Delete Job?'
}) => {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onSubmit(reason);
        setReason('');
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <AppIcon name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Please tell us why you are deleting this job. This will be shown to applicants.</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Reason (e.g. Workers found, Change of plan...)"
                        placeholderTextColor={Colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <AppButton
                                title="Delete Job"
                                onPress={handleSubmit}
                                disabled={!reason.trim()}
                                style={{ backgroundColor: Colors.error }}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.error,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        color: Colors.textPrimary,
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
});

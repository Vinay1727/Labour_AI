import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

interface Option {
    label: string;
    value: string;
}

interface SelectInputProps {
    label: string;
    options: Option[];
    value?: string;
    onSelect: (value: string) => void;
    placeholder?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    options,
    value,
    onSelect,
    placeholder = 'Select an option'
}) => {
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
                <Text style={[styles.valueText, !selectedOption && styles.placeholder]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onSelect(item.value);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        value === item.value && styles.selectedOptionText
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    selector: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
    },
    valueText: {
        fontSize: 16,
        color: '#000',
    },
    placeholder: {
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '50%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeText: {
        color: '#007AFF',
        fontSize: 16,
    },
    option: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

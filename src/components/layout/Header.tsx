import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.rightContainer}>
                {rightAction}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 24,
        color: '#333',
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ChatListItemProps {
    name: string;
    workType: string;
    lastMessage: string;
    time: string;
    unreadCount?: number;
    onPress: () => void;
}

export const ChatListItem = ({ name, workType, lastMessage, time, unreadCount, onPress }: ChatListItemProps) => {
    const initial = name.charAt(0).toUpperCase();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.time}>{time}</Text>
                </View>
                <Text style={styles.workType}>{workType}</Text>
                <View style={styles.bottomRow}>
                    <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
                    {unreadCount ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#9CA3AF',
        fontSize: 24,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
        paddingVertical: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: '#6B7280',
    },
    workType: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    lastMessage: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#25D366', // WhatsApp Green
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});


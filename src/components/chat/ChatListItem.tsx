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
        padding: spacing.m,
        backgroundColor: Colors.white,
        marginHorizontal: spacing.m,
        marginVertical: spacing.xs,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        alignItems: 'center',
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: Colors.textLight,
    },
    workType: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.textLight,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: Colors.secondary,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
});

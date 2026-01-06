import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MessageBubbleProps {
    text: string;
    time: string;
    isSent: boolean;
}

export const MessageBubble = ({ text, time, isSent }: MessageBubbleProps) => {
    return (
        <View style={[styles.wrapper, isSent ? styles.sentWrapper : styles.receivedWrapper]}>
            <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={[styles.text, isSent ? styles.sentText : styles.receivedText]}>{text}</Text>
                <Text style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}>{time}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: spacing.xs,
        paddingHorizontal: spacing.m,
        flexDirection: 'row',
    },
    sentWrapper: {
        justifyContent: 'flex-end',
    },
    receivedWrapper: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: spacing.m,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    sentBubble: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    receivedBubble: {
        backgroundColor: '#E5E7EB',
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 15,
        lineHeight: 20,
    },
    sentText: {
        color: Colors.white,
    },
    receivedText: {
        color: Colors.text,
    },
    time: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    sentTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    receivedTime: {
        color: Colors.textLight,
    },
});

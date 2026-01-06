import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { MessageBubble } from '../components/chat/MessageBubble';

const MOCK_MESSAGES = [
    { id: '1', text: 'Hello, Suni ji!', time: '10:00 AM', isSent: true },
    { id: '2', text: 'Namaste sir, how can I help you?', time: '10:05 AM', isSent: false },
    { id: '3', text: 'I have a masonry project in Noida.', time: '10:06 AM', isSent: true },
    { id: '4', text: 'Can you come tomorrow at 9 AM?', time: '10:06 AM', isSent: true },
    { id: '5', text: 'Yes sir, I am free tomorrow. Please send me the location.', time: '10:10 AM', isSent: false },
];

export default function ChatScreen({ route, navigation }: any) {
    const { name, workType } = route.params || { name: 'Name', workType: 'Work' };
    const [inputText, setInputText] = useState('');

    const initial = name.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <AppIcon name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.workType} numberOfLines={1}>{workType}</Text>
                </View>

                <TouchableOpacity style={styles.callButton}>
                    <AppIcon name="call-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Chat Area */}
            <FlatList
                data={MOCK_MESSAGES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MessageBubble text={item.text} time={item.time} isSent={item.isSent} />
                )}
                contentContainerStyle={styles.chatContent}
                inverted={false} // Would use inverted for real chat apps usually
                showsVerticalScrollIndicator={false}
            />

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.attachButton}>
                        <AppIcon name="add" size={28} color={Colors.textLight} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={Colors.textLight}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText && styles.sendButtonDisabled]}
                        disabled={!inputText}
                    >
                        <AppIcon name="send" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9', // Light background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: Colors.white,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        zIndex: 10,
    },
    backButton: {
        padding: spacing.s,
        marginRight: spacing.xs,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.text,
    },
    workType: {
        fontSize: 12,
        color: Colors.textLight,
    },
    callButton: {
        padding: spacing.s,
    },
    chatContent: {
        paddingVertical: spacing.m,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.s,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    attachButton: {
        padding: spacing.s,
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: spacing.s,
        fontSize: 15,
        maxHeight: 100,
        color: Colors.text,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
});

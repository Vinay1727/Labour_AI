import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ChatListItem } from '../components/chat/ChatListItem';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';

const MOCK_CHATS = [
    { id: '1', name: 'Sunil Mistri', workType: 'Masonry / मिस्त्री', lastMessage: 'I will be there at 9 AM tomorrow.', time: '10:30 AM', unreadCount: 2 },
    { id: '2', name: 'Rahul Contractor', workType: 'Painting Job', lastMessage: 'Payment received, thank you!', time: 'Yesterday', unreadCount: 0 },
    { id: '3', name: 'Amit Kumar', workType: 'Helper / हेल्पर', lastMessage: 'Okay, sir.', time: 'Monday', unreadCount: 0 },
    { id: '4', name: 'Vijay Electrician', workType: 'Wiring Work', lastMessage: 'Can we discuss the site location?', time: '2 Jan', unreadCount: 0 },
];

export default function MessagesScreen() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('messages_tab')}</Text>
                <Text style={styles.subTitle}>{t('work_conversations')}</Text>
            </View>

            <FlatList
                data={MOCK_CHATS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <ChatListItem
                        name={item.name}
                        workType={item.workType}
                        lastMessage={item.lastMessage}
                        time={item.time}
                        unreadCount={item.unreadCount}
                        onPress={() => navigation.navigate('Chat', { chatId: item.id, name: item.name, workType: item.workType })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIllustration}>
                            <Text style={styles.emptyIcon}>💬</Text>
                        </View>
                        <Text style={styles.emptyText}>{t('no_messages_yet')}</Text>
                        <Text style={styles.emptySubText}>{t('contact_someone_chats')}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    header: {
        padding: spacing.l,
        backgroundColor: '#DBEAFE',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: spacing.m,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    subTitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: spacing.xl,
    },
    emptyIllustration: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.l,
        elevation: 2,
    },
    emptyIcon: {
        fontSize: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 8,
    },
});

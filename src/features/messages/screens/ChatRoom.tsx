import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const ChatRoom = () => {
    return (
        <ScreenWrapper>
            <Header title="Chat" />
            <View style={styles.container}>
                <Text>Chat interface messages</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

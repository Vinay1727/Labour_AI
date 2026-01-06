import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const ChatList = () => {
    return (
        <ScreenWrapper>
            <Header title="Messages" />
            <View style={styles.container}>
                <Text>List of active conversations</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const MyRequests = () => {
    return (
        <ScreenWrapper>
            <Header title="My Requests" />
            <View style={styles.container}>
                <Text>List of requests made to labourers</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const WorkRequests = () => {
    return (
        <ScreenWrapper>
            <Header title="Work Requests" />
            <View style={styles.container}>
                <Text>Incoming requests from contractors</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

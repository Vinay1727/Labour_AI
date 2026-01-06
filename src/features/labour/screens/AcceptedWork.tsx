import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const AcceptedWork = () => {
    return (
        <ScreenWrapper>
            <Header title="Accepted Work" />
            <View style={styles.container}>
                <Text>List of jobs currently working on</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

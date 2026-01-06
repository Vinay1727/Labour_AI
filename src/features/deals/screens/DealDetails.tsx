import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const DealDetails = () => {
    return (
        <ScreenWrapper>
            <Header title="Deal Details" />
            <View style={styles.container}>
                <Text>Full details of the deal/transaction</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

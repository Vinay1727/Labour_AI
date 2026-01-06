import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';

export const PostWorkScreen = () => {
    return (
        <ScreenWrapper>
            <Header title="Post New Job" />
            <View style={styles.container}>
                <Text>Form to post new work goes here</Text>
                {/* Add inputs for Job Title, Description, Pay, Location */}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

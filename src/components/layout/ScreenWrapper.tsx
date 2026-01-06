import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, ViewStyle, Platform } from 'react-native';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    statusBarColor?: string;
    barStyle?: 'default' | 'light-content' | 'dark-content';
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    statusBarColor = '#fff',
    barStyle = 'dark-content'
}) => {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: statusBarColor }]}>
            <StatusBar backgroundColor={statusBarColor} barStyle={barStyle} />
            <View style={[styles.content, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Default screen background
    },
});

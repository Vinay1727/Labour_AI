import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

interface AppLoaderProps {
    visible: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ visible }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderBox: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
    children: React.ReactNode;
}

export const AppInitializer: React.FC<Props> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Simulate initialization tasks (e.g., checking auth token, loading fonts)
        const init = async () => {
            try {
                // await checkAuth();
                // await loadAssets();
                setTimeout(() => setIsReady(true), 1000); // Mock delay
            } catch (error) {
                console.error("Initialization failed", error);
                setIsReady(true); // Proceed anyway or show error screen
            }
        };

        init();
    }, []);

    if (!isReady) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

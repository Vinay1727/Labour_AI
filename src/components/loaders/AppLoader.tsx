import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { Colors } from '../../theme/colors'; // Theme colors use karne ke liye
interface AppLoaderProps {
    visible: boolean;
}
export const AppLoader: React.FC<AppLoaderProps> = ({ visible }) => {
    // 1. Animation Values Create Karein
    const rotateAnim = useRef(new Animated.Value(0)).current; // Ghoomne ke liye
    const scaleAnim = useRef(new Animated.Value(0.8)).current; // Pulsing effect ke liye
    useEffect(() => {
        if (visible) {
            // 2. Rotating Animation Start Karein (Hamesha chalta rahega)
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
            // 3. Pulsing (Bada-Chhota hona) Animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible]);
    // 4. Interpolation: 0-1 value ko Degrees (0deg to 360deg) mein badalna
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <View style={styles.loaderBox}>
                    {/* Yeh Animated Ring hai jo ghoomega aur pulse karega */}
                    <Animated.View 
                        style={[
                            styles.ring, 
                            { 
                                transform: [{ rotate: spin }, { scale: scaleAnim }] 
                            }
                        ]} 
                    />
                    {/* Beech mein ek chhota static dot */}
                    <View style={styles.innerDot} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    loaderBox:{
     width: 100,
     height: 100,
     justifyContent: "center",
     alignItems: "center",   
    },
    ring: {
        width:60,
        height:60,
        borderRadius: 30,
        borderWidth: 4,
        borderColor: Colors.primary,
        borderTopColor: "transparent",
        borderLeftColor: 'rgba(37,99,235,0.3)',
    },
    innerDot:{
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    }
});
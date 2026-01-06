import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

// Placeholder screens
const HomeScreen = () => <View><Text>Home</Text></View>;
const HistoryScreen = () => <View><Text>History</Text></View>;
const ProfileScreen = () => <View><Text>Profile</Text></View>;

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { height: 60, paddingBottom: 10 },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

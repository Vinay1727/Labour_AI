import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        </Stack.Navigator>
    );
}

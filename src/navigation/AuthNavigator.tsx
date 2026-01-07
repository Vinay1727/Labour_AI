import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LabourOnboardingScreen from '../screens/LabourOnboardingScreen';
import SkillSelectionScreen from '../screens/SkillSelectionScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="LabourOnboarding" component={LabourOnboardingScreen} />
            <Stack.Screen name="SkillSelection" component={SkillSelectionScreen} />
        </Stack.Navigator>
    );
}

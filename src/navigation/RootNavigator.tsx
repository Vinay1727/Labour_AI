import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import MainTabs from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import PostNewWorkScreen from '../screens/PostNewWorkScreen';
import ChatScreen from '../screens/ChatScreen';
import DetailsScreen from '../screens/DetailsScreen';
import RatingScreen from '../screens/RatingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { role } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="PostNewWork" component={PostNewWorkScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="Rating" component={RatingScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

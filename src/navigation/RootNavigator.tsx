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
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import JobApplicationsScreen from '../screens/JobApplicationsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import MessagesScreen from '../screens/MessagesScreen';
import LabourProfileScreen from '../screens/LabourProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import HelpScreen from '../screens/HelpScreen';
import { useNotifications } from '../hooks/useNotifications';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { role } = useAuth();
  useNotifications();

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
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
          <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
          <Stack.Screen name="JobApplications" component={JobApplicationsScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="LabourProfile" component={LabourProfileScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabs } from './BottomTabs';
import { View, Text } from 'react-native';

// Specific Labour Screens (Placeholders)
const JobSearchScreen = () => <View><Text>Search Jobs</Text></View>;
const JobApplyScreen = () => <View><Text>Apply for Job</Text></View>;

export type LabourStackParamList = {
    LabourTabs: undefined;
    JobSearch: undefined;
    JobApply: { jobId: string };
};

const Stack = createNativeStackNavigator<LabourStackParamList>();

export const LabourNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LabourTabs" component={BottomTabs} />
            <Stack.Screen name="JobSearch" component={JobSearchScreen} />
            <Stack.Screen name="JobApply" component={JobApplyScreen} />
        </Stack.Navigator>
    );
};

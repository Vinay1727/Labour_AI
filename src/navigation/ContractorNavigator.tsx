import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabs } from './BottomTabs';
import { View, Text } from 'react-native';

// Specific Contractor Screens (Placeholders)
const CreateJobScreen = () => <View><Text>Create Job</Text></View>;
const JobDetailsScreen = () => <View><Text>Job Details</Text></View>;

export type ContractorStackParamList = {
    ContractorTabs: undefined;
    CreateJob: undefined;
    JobDetails: { jobId: string };
};

const Stack = createNativeStackNavigator<ContractorStackParamList>();

export const ContractorNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ContractorTabs" component={BottomTabs} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} />
            <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
        </Stack.Navigator>
    );
};

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppIcon } from '../components/common/AppIcon';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import DealsScreen from '../screens/DealsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../theme/colors';
import { useTranslation } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Deals') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <AppIcon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home_tab') }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: t('search_tab') }} />
      <Tab.Screen name="Deals" component={DealsScreen} options={{ tabBarLabel: t('deals_tab') }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: t('messages_tab') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('profile_tab') }} />
    </Tab.Navigator>
  );
}

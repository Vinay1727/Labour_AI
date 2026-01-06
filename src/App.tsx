import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
}

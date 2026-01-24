import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import RootNavigator from './navigation/RootNavigator';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Naya Update Mil Gaya! 🚀',
            'Naye features load karne ke liye app abhi restart hogi.',
            [{ text: 'Theek Hai', onPress: async () => await Updates.reloadAsync() }]
          );
        }
      } catch (error) {
        // You can also add an error handler here
        console.error(`Error fetching latest Expo update: ${error}`);
      }
    }

    async function checkVersionAsync() {
      try {
        const lastUpdateId = await AsyncStorage.getItem('LAST_UPDATE_ID');
        const currentUpdateId = Updates.updateId;

        if (currentUpdateId && lastUpdateId && lastUpdateId !== currentUpdateId) {
          Alert.alert(
            'App Update Ho Chuka Hai! ✨',
            'Aapka app naye version par safely update ho gaya hai aur naye features chalu hain.',
            [{ text: 'Chalo Dekhte Hain' }]
          );
        }

        if (currentUpdateId) {
          await AsyncStorage.setItem('LAST_UPDATE_ID', currentUpdateId);
        }
      } catch (e) {
        console.error('Update Check Error:', e);
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
      checkVersionAsync();
    }
  }, []);

  return (
    <Provider store={store}>
      <LanguageProvider>
        <SettingsProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SettingsProvider>
      </LanguageProvider>
    </Provider>
  );
}

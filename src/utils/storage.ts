import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const storage = {
    getToken: async () => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return await SecureStore.getItemAsync(TOKEN_KEY);
    },

    setToken: async (token: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    },

    removeToken: async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(TOKEN_KEY);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    },

    getUser: async () => {
        try {
            const jsonValue = Platform.OS === 'web'
                ? localStorage.getItem(USER_KEY)
                : await SecureStore.getItemAsync(USER_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error reading user data', e);
            return null;
        }
    },

    setUser: async (user: any) => {
        try {
            const jsonValue = JSON.stringify(user);
            if (Platform.OS === 'web') {
                localStorage.setItem(USER_KEY, jsonValue);
            } else {
                await SecureStore.setItemAsync(USER_KEY, jsonValue);
            }
        } catch (e) {
            console.error('Error saving user data', e);
        }
    },

    removeUser: async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(USER_KEY);
        } else {
            await SecureStore.deleteItemAsync(USER_KEY);
        }
    }
};

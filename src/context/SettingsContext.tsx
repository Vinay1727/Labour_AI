import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
    notificationsEnabled: boolean;
    vibrationEnabled: boolean;
}

interface SettingsContextType extends Settings {
    updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>(null as any);

const STORAGE_KEY = '@app_settings';

const DEFAULT_SETTINGS: Settings = {
    notificationsEnabled: true,
    vibrationEnabled: true,
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setSettings(JSON.parse(saved));
                }
            } catch (error) {
                console.error('Failed to load settings', error);
            }
        };
        loadSettings();
    }, []);

    const updateSettings = async (updates: Partial<Settings>) => {
        const newSettings = { ...settings, ...updates };

        // Logic: If notifications disabled, vibration must be disabled
        if (updates.notificationsEnabled === false) {
            newSettings.vibrationEnabled = false;
        }

        setSettings(newSettings);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save settings', error);
        }
    };

    return (
        <SettingsContext.Provider value={{ ...settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

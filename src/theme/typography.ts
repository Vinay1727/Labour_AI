import { Platform } from 'react-native';

export const typography = {
    family: Platform.select({
        ios: 'System',
        android: 'sans-serif',
        default: 'System',
    }),
    size: {
        appTitle: 22,
        screenHeading: 20,
        sectionTitle: 18,
        body: 15,
        small: 12,
        button: 16,
    },
    weight: {
        regular: '400' as const,
        medium: '500' as const,
        semiBold: '600' as const,
        bold: '700' as const,
    },
    lineHeight: {
        appTitle: 28,
        screenHeading: 26,
        sectionTitle: 24,
        body: 22,
        small: 18,
    }
};

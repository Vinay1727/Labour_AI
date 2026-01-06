import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from '../components/common/AppButton';
import { useTranslation } from '../context/LanguageContext';
import { Language } from '../i18n';

const { width } = Dimensions.get('window');

export default function LanguageSelectionScreen({ route, navigation }: any) {
    const { language, changeLanguage, isReady, t } = useTranslation();
    const [selectedLang, setSelectedLang] = useState<Language>(language);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isReady) {
            setSelectedLang(language);
        }
    }, [isReady, language]);

    const languages: { id: Language; label: string; subLabel: string; icon: string }[] = [
        { id: 'en', label: 'English', subLabel: 'English', icon: '🇺🇸' },
        { id: 'hi', label: 'हिंदी', subLabel: 'Hindi', icon: '🇮🇳' },
        { id: 'hinglish', label: 'Hinglish', subLabel: 'Hinglish', icon: '🗣️' },
    ];

    const getContinueLabel = () => {
        switch (selectedLang) {
            case 'en': return 'Continue';
            case 'hi': return 'आगे बढ़ें';
            case 'hinglish': return 'Aage Badhein';
            default: return 'Continue';
        }
    };

    const handleContinue = async () => {
        setIsLoading(true);
        await changeLanguage(selectedLang);
        setIsLoading(false);
        const fromSettings = route.params?.fromSettings;
        if (fromSettings) {
            navigation.goBack();
        } else {
            navigation.navigate('UserDetails');
        }
    };

    if (!isReady) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>LC</Text>
                    </View>
                    <Text style={styles.appName}>Labour Chowk</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{t('choose_language')}</Text>
                    <Text style={styles.subTitle}>भाषा चुनें</Text>

                    <View style={styles.list}>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.id}
                                style={[
                                    styles.langButton,
                                    selectedLang === lang.id && styles.selectedButton
                                ]}
                                onPress={() => setSelectedLang(lang.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.langIcon}>{lang.icon}</Text>
                                <View style={styles.langTexts}>
                                    <Text style={[
                                        styles.langLabel,
                                        selectedLang === lang.id && styles.selectedLabel
                                    ]}>{lang.label}</Text>
                                    <Text style={styles.langSubLabel}>{lang.subLabel}</Text>
                                </View>
                                {selectedLang === lang.id && (
                                    <View style={styles.checkCircle}>
                                        <Text style={styles.checkIcon}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <AppButton
                    title={getContinueLabel()}
                    onPress={handleContinue}
                    loading={isLoading}
                    style={styles.continueButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.l,
        paddingTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    logoText: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: typography.weight.bold,
    },
    appName: {
        marginTop: spacing.sm,
        fontSize: 24,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: typography.size.screenHeading,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    list: {
        gap: spacing.md,
    },
    langButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md * 1.2,
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    selectedButton: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    langIcon: {
        fontSize: 30,
        marginRight: spacing.md,
    },
    langTexts: {
        flex: 1,
    },
    langLabel: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    selectedLabel: {
        color: Colors.primary,
    },
    langSubLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkIcon: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    continueButton: {
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
});

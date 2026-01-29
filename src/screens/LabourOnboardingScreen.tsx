import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from '../components/common/AppButton';
import { AppIcon } from '../components/common/AppIcon';
import { useTranslation } from '../context/LanguageContext';

export default function LabourOnboardingScreen({ navigation }: any) {
    const { updateProfile } = useAuth();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleChoice = async (isSkilled: boolean) => {
        if (!isSkilled) {
            setIsLoading(true);
            try {
                await updateProfile({
                    role: 'labour',
                    isSkilled: false,
                    skills: []
                } as any);
                // AuthContext updates user, RootNavigator moves to Home
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        } else {
            navigation.navigate('SkillSelection');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('tell_skill' as any)}</Text>
                </View>

                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{t('is_skilled_ कारीगर' as any)}</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.optionCard, styles.yesCard]}
                        onPress={() => handleChoice(true)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconCircle}>
                            <AppIcon name="star" size={32} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('yes_skilled' as any)}</Text>
                            <Text style={styles.optionDesc}>{t('skilled_examples' as any)}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionCard, styles.noCard]}
                        onPress={() => handleChoice(false)}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: Colors.textSecondary }]}>
                            <AppIcon name="people" size={32} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('no_helper' as any)}</Text>
                            <Text style={styles.optionDesc}>{t('helper_desc' as any)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    questionContainer: {
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
    },
    questionSubText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    optionsContainer: {
        gap: 20,
    },
    optionCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        backgroundColor: Colors.white,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    yesCard: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    noCard: {
        borderWidth: 2,
        borderColor: Colors.border,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    optionDesc: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    }
});

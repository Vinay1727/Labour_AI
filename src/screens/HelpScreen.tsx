import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';

export default function HelpScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const handleCall = () => {
        Linking.openURL('tel:+919617271725').catch(() => {
            Alert.alert('Error', 'Unable to open phone dialer');
        });
    };

    const handleEmail = () => {
        Linking.openURL('mailto:vvinaybadnoriya@gmail.com').catch(() => {
            Alert.alert('Error', 'Unable to open email app');
        });
    };

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?phone=919617271725&text=Hi, I need help with Labour Chowk app').catch(() => {
            Alert.alert('Error', 'WhatsApp is not installed');
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{t('help_support' as any)}</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroSection}>
                    <AppIcon name="help-buoy-outline" size={80} color={Colors.primary} />
                    <Text style={styles.heroTitle}>{t('help_hero_title' as any)}</Text>
                    <Text style={styles.heroSub}>{t('help_hero_sub' as any)}</Text>
                </View>

                <View style={styles.contactOptions}>
                    <TouchableOpacity style={styles.option} onPress={handleWhatsApp}>
                        <View style={[styles.iconBox, { backgroundColor: '#25D366' }]}>
                            <AppIcon name="logo-whatsapp" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('help_whatsapp_title' as any)}</Text>
                            <Text style={styles.optionSub}>{t('help_whatsapp_sub' as any)}</Text>
                        </View>
                        <AppIcon name="chevron-forward" size={20} color={Colors.textTertiary || '#94A3B8'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={handleCall}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.info }]}>
                            <AppIcon name="call" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('help_call_title' as any)}</Text>
                            <Text style={styles.optionSub}>{t('help_call_sub' as any)}</Text>
                        </View>
                        <AppIcon name="chevron-forward" size={20} color={Colors.textTertiary || '#94A3B8'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={handleEmail}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.error }]}>
                            <AppIcon name="mail" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>{t('help_email_title' as any)}</Text>
                            <Text style={styles.optionSub}>{t('help_email_sub' as any)}</Text>
                        </View>
                        <AppIcon name="chevron-forward" size={20} color={Colors.textTertiary || '#94A3B8'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.faqHeader}>{t('faq_header' as any)}</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>{t('faq_q1' as any)}</Text>
                        <Text style={styles.faqAnswer}>{t('faq_a1' as any)}</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>{t('faq_q2' as any)}</Text>
                        <Text style={styles.faqAnswer}>{t('faq_a2' as any)}</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>{t('faq_q3' as any)}</Text>
                        <Text style={styles.faqAnswer}>{t('faq_a3' as any)}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backBtn: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: Colors.white,
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: 16,
    },
    heroSub: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    contactOptions: {
        padding: spacing.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    optionSub: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    faqSection: {
        padding: spacing.lg,
    },
    faqHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    faqItem: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 6,
    },
    faqAnswer: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    }
});

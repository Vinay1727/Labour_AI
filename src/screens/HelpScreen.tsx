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
        Linking.openURL('tel:+919876543210').catch(() => {
            Alert.alert('Error', 'Unable to open phone dialer');
        });
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@labourchowk.ai').catch(() => {
            Alert.alert('Error', 'Unable to open email app');
        });
    };

    const handleWhatsApp = () => {
        Linking.openURL('whatsapp://send?phone=919876543210&text=Hi, I need help with Labour Chowk app').catch(() => {
            Alert.alert('Error', 'WhatsApp is not installed');
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('help_support' as any)}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroSection}>
                    <AppIcon name="help-buoy-outline" size={80} color={Colors.primary} />
                    <Text style={styles.heroTitle}>Kisse baat karni hai?</Text>
                    <Text style={styles.heroSub}>Hum apki poori madat karenge.</Text>
                </View>

                <View style={styles.contactOptions}>
                    <TouchableOpacity style={styles.option} onPress={handleWhatsApp}>
                        <View style={[styles.iconBox, { backgroundColor: '#25D366' }]}>
                            <AppIcon name="logo-whatsapp" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>WhatsApp karein</Text>
                            <Text style={styles.optionSub}>Sabse tej kaam hota hai</Text>
                        </View>
                        <AppIcon name="chevron-forward" size={20} color={Colors.textTertiary || '#94A3B8'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={handleCall}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.info }]}>
                            <AppIcon name="call" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Direct Call</Text>
                            <Text style={styles.optionSub}>Subah 9 se Shaam 6 tak</Text>
                        </View>
                        <AppIcon name="chevron-forward" size={20} color={Colors.textTertiary || '#94A3B8'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={handleEmail}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.error }]}>
                            <AppIcon name="mail" size={24} color={Colors.white} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Email Bhejein</Text>
                            <Text style={styles.optionSub}>Grievance aur details ke liye</Text>
                        </View>
                        <AppIcon name="chevron-forward" size={20} color={Colors.textTertiary || '#94A3B8'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.faqHeader}>Common Sawaal (FAQ)</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Kaam kaise milega?</Text>
                        <Text style={styles.faqAnswer}>Apni profile poori karein aur paas ke 'Nearby Work' area mein apply karein.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Paisa kab milega?</Text>
                        <Text style={styles.faqAnswer}>Kaam khatam hone par contractor aapko cash ya UPI se pay karega. Deal khatam hote hi rating zaroor dein.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Attendance lagana kyun zaruri hai?</Text>
                        <Text style={styles.faqAnswer}>Attendance se contractor ka bharosa badhta hai aur aapki success rate upar jaati hai.</Text>
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
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

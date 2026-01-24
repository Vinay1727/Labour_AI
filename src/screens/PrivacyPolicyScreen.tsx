import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{t('privacy_policy' as any)}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>1. Data Collection</Text>
                <Text style={styles.text}>
                    We collect personal information such as name, phone number, and location to facilitate connections between contractors and labourers.
                </Text>

                <Text style={styles.sectionTitle}>2. Use of Information</Text>
                <Text style={styles.text}>
                    Your information is used to match you with relevant work opportunities or workers, provide support, and improve our services.
                </Text>

                <Text style={styles.sectionTitle}>3. Location Services</Text>
                <Text style={styles.text}>
                    The app uses background location services to verify presence at work sites for attendance purposes. This data is only used for work verification.
                </Text>

                <Text style={styles.sectionTitle}>4. Contact Sharing</Text>
                <Text style={styles.text}>
                    Your phone number is shared with the other party only when a deal is active or when you explicitly initiate a call or chat.
                </Text>

                <Text style={styles.sectionTitle}>5. Security</Text>
                <Text style={styles.text}>
                    We take reasonable measures to protect your data from unauthorized access or disclosure.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Last updated: January 2026</Text>
                    <Text style={styles.footerText}>Contact: support@labourchowk.ai</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
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
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: 20,
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.textSecondary,
    },
    footer: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: Colors.textTertiary || '#94A3B8',
        marginBottom: 4,
    }
});

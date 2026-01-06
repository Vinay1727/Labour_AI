import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon, AppIconName } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SettingRowProps {
    icon: AppIconName;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
}

const SettingRow = ({ icon, title, subtitle, onPress, rightElement, destructive }: SettingRowProps) => (
    <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.iconContainer, destructive && styles.destructiveIconBg]}>
            <AppIcon name={icon} size={22} color={destructive ? Colors.error : Colors.primary} />
        </View>
        <View style={styles.rowTexts}>
            <Text style={[styles.rowTitle, destructive && styles.destructiveText]}>{title}</Text>
            {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement ? rightElement : (
            <AppIcon name="chevron-forward" size={20} color={Colors.textSecondary} />
        )}
    </TouchableOpacity>
);

export default function SettingsScreen({ navigation }: any) {
    const { t, language } = useTranslation();
    const { notificationsEnabled, vibrationEnabled, updateSettings } = useSettings();
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            t('logout_confirm'), // Need to add this to i18n
            [
                { text: t('ignore'), style: 'cancel' },
                {
                    text: t('logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <AppIcon name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings_tab')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('notifications_section')}</Text>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon="notifications-outline"
                            title={t('notifications')}
                            rightElement={
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={(val) => updateSettings({ notificationsEnabled: val })}
                                    trackColor={{ false: Colors.border, true: Colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : Colors.white}
                                />
                            }
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon="pulse-outline"
                            title={t('vibration')}
                            subtitle={!notificationsEnabled ? t('vibration_disabled') : undefined}
                            rightElement={
                                <Switch
                                    value={vibrationEnabled}
                                    onValueChange={(val) => updateSettings({ vibrationEnabled: val })}
                                    disabled={!notificationsEnabled}
                                    trackColor={{ false: Colors.border, true: Colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : Colors.white}
                                />
                            }
                        />
                    </View>
                </View>

                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('language_section')}</Text>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon="language-outline"
                            title={t('change_language')}
                            subtitle={language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'Hinglish'}
                            onPress={() => navigation.navigate('LanguageSelection', { fromSettings: true })}
                        />
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('account_section')}</Text>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon="person-outline"
                            title={t('edit_profile')}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon="help-circle-outline"
                            title={t('help_support')}
                            onPress={() => { }}
                        />
                        <View style={styles.separator} />
                        <SettingRow
                            icon="document-text-outline"
                            title={t('privacy_policy')}
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* App Info */}
                <View style={styles.section}>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon="information-circle-outline"
                            title={t('app_version')}
                            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
                        />
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <AppIcon name="log-out-outline" size={22} color={Colors.error} />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>

                <View style={styles.footerSpace} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backBtn: {
        padding: 4,
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: spacing.md,
    },
    section: {
        marginBottom: spacing.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: typography.weight.bold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.sm,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    rowTexts: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
    },
    rowSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border,
        marginLeft: 40 + spacing.md * 2, // Align with text
    },
    versionText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.error + '40', // Semi-transparent
        marginTop: spacing.md,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: Colors.error,
    },
    destructiveIconBg: {
        backgroundColor: Colors.error + '20',
    },
    destructiveText: {
        color: Colors.error,
    },
    footerSpace: {
        height: 40,
    }
});

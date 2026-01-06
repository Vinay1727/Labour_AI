import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from '../components/common/AppButton';

export default function UserDetailsScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigation.navigate('RoleSelection', { name, phone });
        }, 500);
    };

    const isButtonDisabled = !name.trim() || phone.length < 10;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                            <Text style={styles.backArrow}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Enter Details</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Basic Info / बुनियादी जानकारी</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name / पूरा नाम</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex. Vinay Kumar"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number / मोबाइल नंबर</Text>
                            <View style={styles.phoneInputContainer}>
                                <Text style={styles.countryCode}>+91</Text>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="10 digit number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor={Colors.textSecondary}
                                />
                            </View>
                        </View>

                        <Text style={styles.note}>We will send an OTP for verification.</Text>
                    </View>

                    <View style={styles.footer}>
                        <AppButton
                            title="Continue / आगे बढ़ें"
                            onPress={handleContinue}
                            disabled={isButtonDisabled}
                            loading={isLoading}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        padding: spacing.containerPadding,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backArrow: {
        fontSize: 24,
        color: Colors.textPrimary,
    },
    headerTitle: {
        fontSize: typography.size.screenHeading,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: spacing.lg,
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardTitle: {
        fontSize: typography.size.sectionTitle,
        fontWeight: typography.weight.bold,
        color: Colors.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.size.body - 1,
        fontWeight: typography.weight.semiBold,
        color: Colors.textPrimary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: Colors.textInput,
        borderRadius: 12,
        padding: spacing.md,
        fontSize: typography.size.body,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.textInput,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    countryCode: {
        paddingLeft: spacing.md,
        fontSize: typography.size.body,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
        paddingRight: spacing.sm,
    },
    phoneInput: {
        flex: 1,
        padding: spacing.md,
        fontSize: typography.size.body,
        color: Colors.textPrimary,
    },
    note: {
        fontSize: typography.size.small,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
    },
});

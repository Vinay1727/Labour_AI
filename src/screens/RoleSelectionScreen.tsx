import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from '../components/common/AppButton';

export default function RoleSelectionScreen({ navigation }: any) {
    const { updateRole } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'contractor' | 'labour' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (selectedRole) {
            setIsLoading(true);
            try {
                if (selectedRole === 'contractor') {
                    await updateRole(selectedRole);
                } else {
                    navigation.navigate('LabourOnboarding');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>आप क्या करना चाहते हैं?</Text>
                    <Text style={styles.subTitle}>What do you want to do?</Text>
                </View>

                <View style={styles.cardsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.roleCard,
                            styles.contractorCard,
                            selectedRole === 'contractor' && styles.selectedContractorCard
                        ]}
                        onPress={() => setSelectedRole('contractor')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.iconContainer}>
                            <Text style={styles.roleIcon}>🏗️</Text>
                        </View>
                        <View style={styles.cardTextContent}>
                            <Text style={styles.roleTitle}>I want to give work</Text>
                            <Text style={styles.roleHindi}>मजदूर चाहिए</Text>
                            <Text style={styles.roleDesc}>Post jobs and hire nearby workers for your projects.</Text>
                        </View>
                        {selectedRole === 'contractor' && <View style={styles.radioActive} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.roleCard,
                            styles.labourCard,
                            selectedRole === 'labour' && styles.selectedLabourCard
                        ]}
                        onPress={() => setSelectedRole('labour')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.iconContainer}>
                            <Text style={styles.roleIcon}>👷</Text>
                        </View>
                        <View style={styles.cardTextContent}>
                            <Text style={styles.roleTitle}>I want to work</Text>
                            <Text style={styles.roleHindi}>काम चाहिए</Text>
                            <Text style={styles.roleDesc}>Find nearby work and earn daily wages easily.</Text>
                        </View>
                        {selectedRole === 'labour' && <View style={styles.radioActive} />}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <AppButton
                        title="Start / शुरू करें"
                        onPress={handleConfirm}
                        disabled={!selectedRole}
                        loading={isLoading}
                    />
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
        padding: spacing.layout.containerPaddding,
        paddingTop: 40,
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.size.appTitle,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    subTitle: {
        fontSize: typography.size.sectionTitle,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    cardsContainer: {
        gap: spacing.md,
        flex: 1,
    },
    roleCard: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 24,
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: 'transparent',
        elevation: 4,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        alignItems: 'center',
    },
    cardTextContent: {
        flex: 1,
    },
    contractorCard: {
        borderColor: Colors.headerBlue,
    },
    labourCard: {
        borderColor: Colors.headerGreen,
    },
    selectedContractorCard: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    selectedLabourCard: {
        borderColor: Colors.secondary,
        backgroundColor: Colors.secondaryLight,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.textInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    roleIcon: {
        fontSize: 32,
    },
    roleTitle: {
        fontSize: typography.size.sectionTitle,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    roleHindi: {
        fontSize: typography.size.body + 1,
        color: Colors.primary,
        fontWeight: typography.weight.semiBold,
        marginVertical: 2,
    },
    roleDesc: {
        fontSize: typography.size.small,
        color: Colors.textSecondary,
    },
    radioActive: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        borderWidth: 4,
        borderColor: Colors.white,
        position: 'absolute',
        top: 20,
        right: 20,
    },
    footer: {
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    }
});

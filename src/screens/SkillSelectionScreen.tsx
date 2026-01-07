import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AppButton } from '../components/common/AppButton';
import { AppIcon } from '../components/common/AppIcon';

const SKILLS = [
    { id: 'mistri', name: 'Mistri / Mason (मिस्त्री)', icon: 'construct' },
    { id: 'painter', name: 'Painter (पेंटर)', icon: 'brush' },
    { id: 'plumber', name: 'Plumber (प्लंबर)', icon: 'water' },
    { id: 'electrician', name: 'Electrician (इलेक्ट्रीशियन)', icon: 'flash' },
    { id: 'carpenter', name: 'Carpenter (बढ़ई)', icon: 'hammer' },
    { id: 'welder', name: 'Welder (वेल्डर)', icon: 'flame' },
    { id: 'tile_worker', name: 'Tile Worker (टाइल्स कारीगर)', icon: 'grid' },
    { id: 'fabricator', name: 'Fabricator (फैब्रिकेटर)', icon: 'settings' },
];

export default function SkillSelectionScreen() {
    const { updateProfile } = useAuth();
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleSkill = (skillId: string) => {
        if (selectedSkills.includes(skillId)) {
            setSelectedSkills(selectedSkills.filter(id => id !== skillId));
        } else {
            setSelectedSkills([...selectedSkills, skillId]);
        }
    };

    const handleConfirm = async () => {
        if (selectedSkills.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one skill.');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                role: 'labour',
                isSkilled: true,
                skills: selectedSkills
            } as any);
            // On success, AuthContext will update user and navigation will handle transition
        } catch (e) {
            Alert.alert('Error', 'Failed to save skills. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderSkillItem = ({ item }: { item: typeof SKILLS[0] }) => {
        const isSelected = selectedSkills.includes(item.id);
        return (
            <TouchableOpacity
                style={[
                    styles.skillCard,
                    isSelected && styles.selectedSkillCard
                ]}
                onPress={() => toggleSkill(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
                    <AppIcon
                        name={item.icon as any}
                        size={24}
                        color={isSelected ? Colors.white : Colors.primary}
                    />
                </View>
                <Text style={[styles.skillName, isSelected && styles.selectedSkillName]}>
                    {item.name}
                </Text>
                {isSelected && (
                    <View style={styles.checkMark}>
                        <AppIcon name="checkmark-circle" size={20} color={Colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>अपनी स्किल्स चुनें</Text>
                <Text style={styles.subTitle}>Select your skills (Multiple allowed)</Text>
            </View>

            <FlatList
                data={SKILLS}
                renderItem={renderSkillItem}
                keyExtractor={item => item.id}
                numColumns={1}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <Text style={styles.selectedCount}>
                    {selectedSkills.length} skills selected
                </Text>
                <AppButton
                    title="Finish Setup / सेटअप पूरा करें"
                    onPress={handleConfirm}
                    loading={isLoading}
                    disabled={selectedSkills.length === 0}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: 24,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    subTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
    },
    skillCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedSkillCard: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.textInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    selectedIconContainer: {
        backgroundColor: Colors.primary,
    },
    skillName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        flex: 1,
    },
    selectedSkillName: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    checkMark: {
        marginLeft: 8,
    },
    footer: {
        padding: 24,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    selectedCount: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 12,
    }
});

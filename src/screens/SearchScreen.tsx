import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { WorkCard } from '../components/search/WorkCard';
import { LabourCard } from '../components/search/LabourCard';
import { AppButton } from '../components/common/AppButton';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import { Job, Labour } from '../types/search';

// Standardized Mock Data following API Contract
const MOCK_JOBS: Job[] = [
    {
        jobId: 'job_1',
        workType: 'House Painter',
        description: 'Need a professional painter for a 3BHK flat.',
        location: { area: 'Sec 62', city: 'Noida' },
        distanceKm: 1.2,
        duration: '3 Days',
        payment: { amount: 600, unit: 'per day' },
        contractor: { contractorId: 'con_1', name: 'Rakesh Verma' },
        status: 'open',
        createdAt: new Date().toISOString()
    },
    {
        jobId: 'job_2',
        workType: 'Brick Specialist',
        description: 'Wall construction work for a new house.',
        location: { area: 'Indirapuram', city: 'Ghaziabad' },
        distanceKm: 2.5,
        duration: 'Contract',
        payment: { amount: 8000, unit: 'total' },
        contractor: { contractorId: 'con_2', name: 'Smart Builders' },
        status: 'open',
        createdAt: new Date().toISOString()
    },
];

const MOCK_LABOURS: Labour[] = [
    {
        labourId: 'lab_1',
        name: 'Sunil Kumar',
        skill: 'Mistri (Mason)',
        experienceYears: 5,
        location: { area: 'Noida Sec 15', city: 'Noida' },
        rating: 4.8,
        availability: 'today',
        lastActive: new Date().toISOString()
    },
    {
        labourId: 'lab_2',
        name: 'Ramesh Singh',
        skill: 'Painter',
        experienceYears: 8,
        location: { area: 'Sec 44', city: 'Gurgaon' },
        rating: 4.9,
        availability: 'tomorrow',
        lastActive: new Date().toISOString()
    },
];

export default function SearchScreen() {
    const { role } = useAuth();
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const isLabour = role === 'labour';

    const config = useMemo(() => {
        if (isLabour) {
            return {
                title: t('search_work'),
                helper: t('nearby_work_for_you'),
                placeholder: t('search_placeholder_work'),
                categories: ['All', 'Painter', 'Mistri', 'Helper', 'Electrician', 'Daily Work', 'Contract'],
                emptyTitle: t('no_work_found_nearby'),
                emptySub: t('try_changing_filters'),
            };
        }
        return {
            title: t('find_labour'),
            helper: t('search_skilled_labour_near'),
            placeholder: t('search_placeholder_labour'),
            categories: ['All', 'Painter', 'Mistri', 'Helper', 'Skilled', 'Available Now'],
            emptyTitle: t('no_labour_available'),
            emptySub: t('post_new_work_more_responses'),
        };
    }, [isLabour, t]);

    const navigateToDetails = (id: string) => {
        navigation.navigate('Details', { itemId: id, itemType: isLabour ? 'job' : 'labour' });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{config.title}</Text>
                    <Text style={styles.subTitle}>{config.helper}</Text>
                </View>
                {!isLabour && (
                    <TouchableOpacity
                        style={styles.postBtnMini}
                        onPress={() => navigation.navigate('PostNewWork')}
                    >
                        <AppIcon name="add" size={20} color={Colors.white} />
                        <Text style={styles.postBtnMiniText}>{t('apply')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Role Warning for Labour */}
            {isLabour && (
                <View style={styles.warningBox}>
                    <AppIcon name="alert-circle" size={18} color="#B45309" />
                    <Text style={styles.warningText}>{t('complete_active_work_applying')}</Text>
                </View>
            )}

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <AppIcon name="search-outline" size={20} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={config.placeholder}
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <AppIcon name="close-circle" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {config.categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.chip,
                                selectedCategory === cat && styles.selectedChip
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.chipText,
                                selectedCategory === cat && styles.selectedChipText
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Logic-Based List Rendering */}
            <FlatList
                data={isLabour ? MOCK_JOBS : MOCK_LABOURS}
                keyExtractor={(item: any) => isLabour ? item.jobId : item.labourId}
                contentContainerStyle={styles.resultsList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }: { item: any }) => (
                    isLabour ? (
                        <WorkCard
                            work={item as Job}
                            onApply={() => { }}
                            onViewDetails={(id) => navigateToDetails(id)}
                        />
                    ) : (
                        <LabourCard
                            labour={item as Labour}
                            onContact={(id) => navigation.navigate('Messages')}
                            onViewProfile={(id) => navigateToDetails(id)}
                        />
                    )
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <AppIcon name="search" size={40} color={Colors.border} />
                        </View>
                        <Text style={styles.emptyTitle}>{config.emptyTitle}</Text>
                        <Text style={styles.emptySub}>{config.emptySub}</Text>
                        {!isLabour && (
                            <AppButton
                                title={t('post_new_work')}
                                onPress={() => navigation.navigate('PostNewWork')}
                                style={styles.postBtnLarge}
                            />
                        )}
                    </View>
                }
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.md,
        backgroundColor: Colors.white,
    },
    title: {
        fontSize: typography.size.screenHeading,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
    },
    subTitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    postBtnMini: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    postBtnMiniText: {
        color: Colors.white,
        fontWeight: typography.weight.bold,
        fontSize: 14,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        marginHorizontal: spacing.l,
        marginTop: spacing.sm,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    warningText: {
        fontSize: 12,
        color: '#92400E',
        fontWeight: typography.weight.medium,
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    filtersContainer: {
        marginBottom: spacing.md,
    },
    filterScroll: {
        paddingHorizontal: spacing.l,
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectedChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: typography.weight.medium,
    },
    selectedChipText: {
        color: Colors.white,
        fontWeight: typography.weight.bold,
    },
    resultsList: {
        paddingHorizontal: spacing.l,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: spacing.xl,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.textInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    emptySub: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    postBtnLarge: {
        width: '100%',
    }
});

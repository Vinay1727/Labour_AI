import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/common/AppIcon';
import { Colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { WorkCard } from '../components/search/WorkCard';
import { LabourCard } from '../components/search/LabourCard';
import { AppButton } from '../components/common/AppButton';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from '../context/LanguageContext';
import { Job, Labour } from '../types/search';
import api from '../services/api';
import * as Location from 'expo-location';

export default function SearchScreen() {
    const { role, user } = useAuth();
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [labours, setLabours] = useState<Labour[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [distanceKm, setDistanceKm] = useState<number>(25);
    const [paymentType, setPaymentType] = useState<string | null>(null);
    const [minRating, setMinRating] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<any>(null);

    const isLabour = role === 'labour';

    const getMyLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Please allow location access to find labour near you.");
                return;
            }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setUserLocation(loc.coords);
            return loc.coords;
        } catch (e) { console.log('Location error', e); }
    };

    const fetchResults = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            let loc = userLocation || await getMyLocation();
            const params: any = {
                q: searchQuery,
                distance: distanceKm,
                lat: loc?.latitude,
                lng: loc?.longitude
            };

            if (selectedSkill) params.skill = selectedSkill;
            if (isLabour && paymentType) params.paymentType = paymentType;
            if (!isLabour && minRating) params.rating = minRating;

            const res = await api.get('search', { params });
            if (res.data.success) {
                const { type, results } = res.data.data;
                if (type === 'jobs') setJobs(results);
                else setLabours(results);
            }

            if (!isLabour) {
                const insightRes = await api.get('users/skill-insights', { params: { ...params, distance: 10 } });
                if (insightRes.data.success) setInsights(insightRes.data.data);
            }
        } catch (err) { console.error('Search Fetch Error:', err); }
        finally { setLoading(false); setRefreshing(false); }
    }, [isLabour, searchQuery, distanceKm, selectedSkill, paymentType, minRating, userLocation]);

    useEffect(() => {
        if (isFocused) fetchResults();
    }, [isFocused, distanceKm, selectedSkill, paymentType, minRating]);

    const handleApply = async (jobId: string) => {
        try {
            const res = await api.post(`jobs/${jobId}/apply`);
            if (res.data.success) {
                Alert.alert(t('success' as any), t('application_submitted' as any));
                setJobs(prev => prev.filter(j => j._id !== jobId));
            }
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Application failed'); }
    };

    const renderInsights = () => {
        if (isLabour || insights.length === 0) return null;
        return (
            <View style={styles.insightSection}>
                <Text style={styles.insightTitle}>{t('available_near_you' as any)}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightScroll}>
                    {insights.slice(0, 5).map(item => (
                        <View key={item._id} style={styles.insightCard}>
                            <Text style={styles.insightSkill}>{item._id}</Text>
                            <Text style={styles.insightCount}>{item.count}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchBarContainer}>
                <View style={styles.searchBar}>
                    <AppIcon name="search-outline" size={20} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={isLabour ? t('search_placeholder_work' as any) : t('search_placeholder_labour' as any)}
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => fetchResults()}
                        returnKeyType="search"
                    />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <FilterChip
                    label={distanceKm === 100 ? t('all_distances' as any) : `${distanceKm} km`}
                    icon="navigate-outline"
                    onPress={() => setDistanceKm(distanceKm === 5 ? 10 : distanceKm === 10 ? 25 : distanceKm === 25 ? 100 : 5)}
                    active={distanceKm !== 100}
                />
                {!isLabour && (
                    <FilterChip
                        label="4.0+" icon="star"
                        active={minRating === 4}
                        onPress={() => setMinRating(minRating === 4 ? null : 4)}
                    />
                )}
                {isLabour && (
                    <>
                        <FilterChip label={t('per_day' as any)} active={paymentType === 'per_day'} onPress={() => setPaymentType(paymentType === 'per_day' ? null : 'per_day')} />
                        <FilterChip label={t('fixed_contract' as any)} active={paymentType === 'fixed'} onPress={() => setPaymentType(paymentType === 'fixed' ? null : 'fixed')} />
                    </>
                )}
            </ScrollView>
        </View>
    );

    const renderNearMeSection = () => {
        if (isLabour || labours.length === 0) return null;

        // Show top 5 nearest ones separately on top
        const nearestLabours = [...labours].sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0)).slice(0, 5);

        return (
            <View style={styles.nearMeSection}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Labour Near You 📍</Text>
                    <Text style={styles.distanceInfo}>Within {distanceKm} km</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearMeScroll}>
                    {nearestLabours.map((l: any) => (
                        <TouchableOpacity
                            key={l._id}
                            style={styles.nearMeCard}
                            onPress={() => navigation.navigate('Details', {
                                itemId: l._id,
                                itemType: 'labour',
                                name: l.name,
                                skills: l.skills
                            })}
                        >
                            <View style={styles.nearAvatar}>
                                <Text style={styles.nearAvatarText}>{l.name.charAt(0)}</Text>
                                {l.distance !== undefined && (
                                    <View style={styles.miniDistBadge}>
                                        <Text style={styles.miniDistText}>{(l.distance / 1000).toFixed(1)}km</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.nearName} numberOfLines={1}>{l.name}</Text>
                            <Text style={styles.nearSkill} numberOfLines={1}>{l.skills?.[0] || 'Worker'}</Text>
                            <View style={styles.nearRating}>
                                <AppIcon name="star" size={10} color="#F59E0B" />
                                <Text style={styles.nearRatingText}>{l.averageRating?.toFixed(1) || '0.0'}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <FlatList
                data={isLabour ? jobs : labours}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {renderNearMeSection()}
                        {renderInsights()}
                        {!isLabour && labours.length > 0 && (
                            <Text style={styles.allLaboursTitle}>All Skilled Workers</Text>
                        )}
                    </>
                }
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResults(true); }} />}
                renderItem={({ item }) => (
                    isLabour ? (
                        <WorkCard
                            work={item as Job}
                            onApply={handleApply}
                            onViewDetails={(jobId) => navigation.navigate('Details', { itemId: jobId, itemType: 'job' })}
                        />
                    ) : (
                        <LabourCard
                            labour={item as Labour}
                            onContact={() => navigation.navigate('Messages')}
                            onViewProfile={(l) => navigation.navigate('Details', {
                                itemId: l._id,
                                itemType: 'labour',
                                name: l.name,
                                skills: l.skills
                            })}
                        />
                    )
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AppIcon name="search-outline" size={60} color={Colors.border} />
                        <Text style={styles.emptyTitle}>{isLabour ? "No matching jobs found nearby" : "No labour found"}</Text>
                    </View>
                }
            />

            {!isLabour && searchQuery && (
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PostNewWork', { skill: searchQuery })}>
                    <AppIcon name="add" size={24} color={Colors.white} />
                    <Text style={styles.fabText}>Post Job for {searchQuery}</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const FilterChip = ({ label, active, onPress, icon }: any) => (
    <TouchableOpacity style={[styles.chip, active && styles.activeChip]} onPress={onPress}>
        {icon && <AppIcon name={icon} size={14} color={active ? Colors.white : Colors.primary} />}
        <Text style={[styles.chipText, active && styles.activeChipText]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { backgroundColor: Colors.white, paddingBottom: spacing.md, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10 },
    searchBarContainer: { paddingHorizontal: spacing.l, paddingTop: spacing.md, marginBottom: spacing.xs },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 16, height: 56 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
    filterScroll: { paddingHorizontal: spacing.l, gap: 10 },
    chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
    activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    activeChipText: { color: Colors.white },
    listContent: { padding: spacing.l, paddingBottom: 100 },
    insightSection: { marginTop: spacing.md, marginBottom: spacing.sm },
    insightTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 12, marginLeft: 4 },
    insightScroll: { gap: 12 },
    insightCard: { backgroundColor: Colors.white, padding: 12, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: Colors.primary, width: 100, alignItems: 'center' },
    insightSkill: { fontSize: 12, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
    insightCount: { fontSize: 18, fontWeight: '900', color: Colors.primary, marginTop: 4 },

    // Near Me Section Styles
    nearMeSection: { marginVertical: spacing.md },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    distanceInfo: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
    nearMeScroll: { gap: 15, paddingRight: 20 },
    nearMeCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 16, width: 140, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    nearAvatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 10, position: 'relative' },
    nearAvatarText: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },
    miniDistBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: Colors.secondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: Colors.white },
    miniDistText: { fontSize: 9, fontWeight: 'bold', color: Colors.white },
    nearName: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary },
    nearSkill: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
    nearRating: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    nearRatingText: { fontSize: 10, fontWeight: 'bold', color: '#B45309' },
    allLaboursTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginVertical: 16, marginLeft: 4 },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 20, textAlign: 'center' },
    fab: { position: 'absolute', bottom: 30, left: 30, right: 30, backgroundColor: Colors.secondary, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 10 },
    fabText: { color: Colors.white, fontWeight: '900', fontSize: 16 }
});

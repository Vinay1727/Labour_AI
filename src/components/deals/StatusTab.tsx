import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StatusTabProps {
    tabs: string[];
    activeTab: string;
    onTabPress: (tab: string) => void;
    getLabel?: (tab: string) => string;
}

export const StatusTab = ({ tabs, activeTab, onTabPress, getLabel }: StatusTabProps) => {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    const label = getLabel ? getLabel(tab) : tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, isActive && styles.activeTab]}
                            onPress={() => onTabPress(tab)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        paddingVertical: spacing.m,
    },
    scrollContent: {
        paddingHorizontal: spacing.l,
        gap: 12,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        minWidth: 100,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.white,
    },
});

import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { JobCard } from '../../../components/cards/JobCard';

export const ContractorHome = ({ navigation }: any) => {
    return (
        <ScreenWrapper>
            <Header title="Contractor Dashboard" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                <View style={styles.actionSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <PrimaryButton
                        title="Post New Work"
                        onPress={() => navigation.navigate('CreateJob')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Jobs</Text>
                    <JobCard
                        title="House Painting"
                        location="Sector 18, Noida"
                        pay="₹500/day"
                        postedAt="2 hours ago"
                        onPress={() => { }}
                    />
                    <JobCard
                        title="Plumbing Work"
                        location="Indirapuram"
                        pay="₹800 fixed"
                        postedAt="5 hours ago"
                        onPress={() => { }}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    actionSection: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
});

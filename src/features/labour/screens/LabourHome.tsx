import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { JobCard } from '../../../components/cards/JobCard';

export const LabourHome = ({ navigation }: any) => {
    return (
        <ScreenWrapper>
            <Header title="Find Work" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.actionSection}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.statusBox}>
                        <Text style={styles.statusText}>You are currently: <Text style={styles.available}>Available</Text></Text>
                        <PrimaryButton title="Change Status" onPress={() => { }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Jobs Nearby</Text>
                    <JobCard
                        title="Construction Helper"
                        location="Sector 62, Noida"
                        pay="₹450/day"
                        postedAt="10 mins ago"
                        onPress={() => navigation.navigate('JobApply', { jobId: '1' })}
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
    statusBox: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    statusText: {
        fontSize: 16,
        marginBottom: 12,
    },
    available: {
        color: 'green',
        fontWeight: 'bold',
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

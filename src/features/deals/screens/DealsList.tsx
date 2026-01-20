import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Header } from '../../../components/layout/Header';
import { DealCard } from '../../../components/cards/DealCard';

export const DealsList = () => {
    const deals = [
        { id: '1', job: 'Painting', contractor: 'Ramesh', labour: 'Suresh', amount: '₹500', status: 'pending' },
        { id: '2', job: 'Plumbing', contractor: 'Mukesh', labour: 'Dinesh', amount: '₹1200', status: 'completed' },
    ] as const;

    return (
        <ScreenWrapper>
            <Header title="My Deals" />
            <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={styles.list}
                data={deals}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <DealCard
                        jobTitle={item.job}
                        contractorName={item.contractor}
                        labourName={item.labour}
                        amount={item.amount}
                        status={item.status}
                        onPress={() => { }}
                    />
                )}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
});

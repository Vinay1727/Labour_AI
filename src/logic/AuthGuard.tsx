import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type UserRole = 'contractor' | 'labour' | 'guest';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    // This would usually come from a global store/context
    currentUserRole?: UserRole;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole, currentUserRole = 'guest' }) => {

    if (requiredRole && currentUserRole !== requiredRole) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Access Denied. Required Role: {requiredRole}</Text>
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        color: 'red',
    },
});

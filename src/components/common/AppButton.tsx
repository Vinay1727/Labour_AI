import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View
} from 'react-native';
import { Colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const AppButton = ({
    title,
    onPress,
    type = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon
}: AppButtonProps) => {

    const getBackgroundColor = () => {
        if (disabled) return Colors.textDisabled;
        switch (type) {
            case 'primary': return Colors.primary;
            case 'secondary': return Colors.white;
            case 'danger': return Colors.error;
            case 'success': return Colors.success;
            default: return Colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return Colors.white;
        switch (type) {
            case 'primary': return Colors.white;
            case 'secondary': return Colors.primary;
            case 'danger': return Colors.white;
            case 'success': return Colors.white;
            default: return Colors.white;
        }
    };

    const containerStyle: ViewStyle = {
        backgroundColor: getBackgroundColor(),
        borderColor: type === 'secondary' ? Colors.primary : 'transparent',
        borderWidth: type === 'secondary' ? 1 : 0,
        opacity: loading ? 0.8 : 1,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[styles.button, containerStyle, style]}
        >
            {loading ? (
                <ActivityIndicator color={type === 'secondary' ? Colors.primary : Colors.white} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[
                        styles.text,
                        { color: getTextColor() },
                        textStyle
                    ]} numberOfLines={1} ellipsizeMode="tail">
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: typography.size.button,
        fontWeight: typography.weight.bold,
    },
    iconContainer: {
        marginRight: spacing.sm,
    }
});

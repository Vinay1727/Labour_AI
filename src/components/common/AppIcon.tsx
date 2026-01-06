import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

/**
 * Standardized Icon names to ensure consistency.
 * Use these as a reference when updating screens.
 */
export type AppIconName = React.ComponentProps<typeof Ionicons>['name'];

interface AppIconProps {
    name: AppIconName;
    size?: number;
    color?: string;
    style?: any;
}

/**
 * AppIcon Component
 * Purpose: Centralize icon usage to Ionicons and prevent invalid name warnings.
 */
export const AppIcon = ({
    name,
    size = 24,
    color = Colors.textPrimary,
    style
}: AppIconProps) => {
    return (
        <Ionicons
            name={name}
            size={size}
            color={color}
            style={style}
        />
    );
};

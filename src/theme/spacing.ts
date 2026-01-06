const baseSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const spacing = {
    ...baseSpacing,

    // Single letter aliases for brevity/legacy
    s: baseSpacing.sm,
    m: baseSpacing.md,
    l: baseSpacing.lg,

    // Layout specific
    gutter: 16,
    containerPadding: 20,
    containerPaddding: 20, // Support typo in existing code
    screenPadding: 24,
    tabBarHeight: 60,
    bottomOverlap: 100,

    // Nested layout object for legacy support
    layout: {
        gutter: 16,
        containerPadding: 20,
        containerPaddding: 20, // Support typo
    }
} as const;

export type Spacing = typeof spacing;

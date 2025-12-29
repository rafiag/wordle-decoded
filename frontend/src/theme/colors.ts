/**
 * Wordle Data Explorer - Color Theme SSOT
 * Single Source of Truth for all colors used in the application.
 * 
 * IMPORTANT: When changing colors, update ONLY this file.
 * All components should import from this file.
 */

// Wordle Brand Colors
export const wordleColors = {
    // Primary brand colors
    green: '#6aaa64',      // Wordle green - correct letter
    yellow: '#c9b458',     // Wordle yellow - present letter
    gray: '#787c7e',       // Wordle gray - absent letter
    darkGray: '#3a3a3c',   // Dark UI elements
    lightGray: '#d3d6da',  // Borders and dividers

    // Extended palette
    greenLight: '#8bc78e',
    greenDark: '#5a8a56',
    yellowLight: '#e6d68f',
    yellowDark: '#b89f42',

    // UI colors
    bgPrimary: '#ffffff',
    bgSecondary: '#f7f8fa',
    bgCard: '#ffffff',
    textPrimary: '#1a1a1b',
    textSecondary: '#565758',
    textLight: '#878a8c',

    // Semantic colors
    positive: '#6aaa64',    // Same as green
    neutral: '#c9b458',     // Same as yellow
    negative: '#eb5757',    // Error/negative

    // Feature-specific colors
    trapAmber: '#f59e0b',   // Trap score display
} as const;

// Chart palette for multi-series visualizations
export const chartPalette = [
    wordleColors.green,
    wordleColors.yellow,
    wordleColors.gray,
    wordleColors.trapAmber,
] as const;

// Semantic chart colors
export const chartColors = {
    primary: wordleColors.green,
    secondary: wordleColors.yellow,
    tertiary: wordleColors.gray,
    accent: wordleColors.trapAmber,
    positive: wordleColors.positive,
    negative: wordleColors.negative,
} as const;

// Type exports for type-safe color usage
export type WordleColor = typeof wordleColors[keyof typeof wordleColors];
export type ChartColor = typeof chartColors[keyof typeof chartColors];

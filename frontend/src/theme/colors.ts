/**
 * Centralized color theme configuration
 * Single Source of Truth for all colors used across the application
 *
 * Theme: Bold Data Noir
 * IMPORTANT: When changing colors, update ONLY this file.
 * All components should import from this file.
 */

export const THEME_COLORS = {
  // Base accent colors (mapped from CSS variables)
  accent: {
    cyan: 'var(--accent-cyan)',     // #00d9ff
    lime: 'var(--accent-lime)',     // #00ff88
    coral: 'var(--accent-coral)',   // #ff6b9d
    orange: 'var(--accent-orange)', // #ffa500
    purple: 'var(--accent-purple)', // #a855f7
  },

  // Text colors
  text: {
    primary: 'var(--text-primary)',     // #f0f0f0
    secondary: 'var(--text-secondary)', // #a0a0a0
    muted: 'var(--text-muted)',         // #666666
  },

  // Background colors
  bg: {
    primary: 'var(--bg-primary)',     // #0a0e27
    secondary: 'var(--bg-secondary)', // #1a1a2e
    card: 'var(--bg-card)',           // #16213e
  },

  // Guess distribution colors (difficulty visualization)
  guess: {
    '1/6': '#00d9ff',     // Cyan (Very Easy)
    '2/6': '#00ff88',     // Lime (Easy)
    '3/6': '#33B277',     // Muted Green (Medium-Easy)
    '4/6': '#666666',     // Muted Grey (Medium) - Pivot point
    '5/6': '#ffa500',     // Orange (Hard)
    '6/6': '#FF884E',     // Coral Orange (Very Hard)
    'Failed': '#ff6b9d'   // Coral (Failed)
  },

  // Sentiment analysis colors
  sentiment: {
    very_neg: '#ff6b9d',  // Coral (Very Negative)
    neg: '#ffa500',       // Orange (Negative)
    neu: '#666666',       // Muted Grey (Neutral)
    pos: '#00ff88',       // Lime (Positive)
    very_pos: '#00d9ff'   // Cyan (Very Positive)
  },

  // Border colors
  border: 'var(--border-color)', // #2a2a4e

  // Glow effects
  glow: {
    cyan: 'var(--glow-cyan)',   // rgba(0, 217, 255, 0.3)
    coral: 'var(--glow-coral)', // rgba(255, 107, 157, 0.3)
  },

  // Common UI colors (not in design system CSS variables)
  ui: {
    white: '#FFFFFF',
    black: '#000000',
    slate: '#334155', // Used for inactive states in charts
  }
} as const;

// Type-safe color access
export type GuessKey = keyof typeof THEME_COLORS.guess;
export type SentimentKey = keyof typeof THEME_COLORS.sentiment;

// Helper function to get guess color by key
export const getGuessColor = (key: GuessKey): string => {
  return THEME_COLORS.guess[key];
};

// Helper function to get sentiment color by key
export const getSentimentColor = (key: SentimentKey): string => {
  return THEME_COLORS.sentiment[key];
};

// Export sentiment colors as array (for charts that need ordered arrays)
export const SENTIMENT_COLORS_ARRAY = [
  THEME_COLORS.sentiment.very_neg,
  THEME_COLORS.sentiment.neg,
  THEME_COLORS.sentiment.neu,
  THEME_COLORS.sentiment.pos,
  THEME_COLORS.sentiment.very_pos
] as const;

// Export guess colors as array (for charts that need ordered arrays)
export const GUESS_COLORS_ARRAY = [
  THEME_COLORS.guess['1/6'],
  THEME_COLORS.guess['2/6'],
  THEME_COLORS.guess['3/6'],
  THEME_COLORS.guess['4/6'],
  THEME_COLORS.guess['5/6'],
  THEME_COLORS.guess['6/6'],
  THEME_COLORS.guess.Failed
] as const;

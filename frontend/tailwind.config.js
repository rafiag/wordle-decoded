/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wordle: {
          // Wordle brand colors (SSOT: src/theme/colors.ts)
          green: '#6aaa64',
          yellow: '#c9b458',
          gray: '#787c7e',
          darkgray: '#3a3a3c',
          lightgray: '#d3d6da',
          // Semantic colors
          positive: '#6aaa64',
          neutral: '#c9b458',
          negative: '#eb5757',
          // Trap section accent
          amber: '#f59e0b',
        },
      },
      spacing: {
        // Compact spacing scale (from mockup)
        'compact-xs': '0.375rem',   // 6px
        'compact-sm': '0.75rem',    // 12px
        'compact-md': '1rem',       // 16px
        'compact-lg': '1.25rem',    // 20px
        'compact-xl': '1.75rem',    // 28px
        'compact-xxl': '2.5rem',    // 40px
      },
      fontSize: {
        // Typography scale (from mockup)
        'hero-title': ['2.25rem', { lineHeight: '1.2' }],    // 36px
        'section-title': ['2rem', { lineHeight: '1.3' }],    // 32px
        'card-header': ['1.5rem', { lineHeight: '1.4' }],    // 24px
        'hero-subtitle': ['1.1rem', { lineHeight: '1.5' }],  // 17.6px
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'badge': '20px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'card-lg': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}

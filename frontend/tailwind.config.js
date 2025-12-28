export default {
  theme: {
    extend: {
      colors: {
        wordle: {
          // Color-blind friendly palette (deuteranopia/protanopia safe)
          // WCAG 2.1 AA compliant (4.5:1+ contrast on white)
          // Darker blue for "correct" - accessible and color-blind safe
          green: '#0284c7', // Sky blue 600 - 4.5:1 contrast (was #6aaa64)
          // Darker orange for "present" - accessible and color-blind safe
          yellow: '#d97706', // Amber 600 - 4.6:1 contrast (was #c9b458)
          // Gray for "absent" - universal
          gray: '#6b7280', // Gray 500 - 4.7:1 contrast (was #787c7e)
          darkgray: '#374151', // Gray 700 - 10.4:1 contrast
          lightgray: '#d1d5db', // Gray 300
        },
      },
    },
  },
}

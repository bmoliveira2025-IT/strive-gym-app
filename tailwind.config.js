/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: We may need to include other paths if you have components elsewhere
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Charcoal Black Theme with Transparency
        background: '#000000', // Pure Black
        surface: '#1C1C1E', // Dark Gray Card
        surfaceHighlight: '#2C2C2E', // Lighter Gray for borders/inputs

        primary: '#4F8FF7', // Refined blue
        primaryLight: '#6BA3F9',
        primaryDark: '#3D7BE5',

        accent: '#F59E0B', // Warm accent

        text: {
          DEFAULT: '#F1F5F9',
          muted: '#94A3B8',
          dim: '#64748B',
        },

        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',

        // Glassmorphism
        glass: {
          DEFAULT: 'rgba(18, 18, 18, 0.7)',
          light: 'rgba(28, 28, 28, 0.5)',
          dark: 'rgba(13, 13, 13, 0.9)',
        }
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}

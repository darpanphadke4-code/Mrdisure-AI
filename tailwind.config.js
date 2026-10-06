/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F7F4',
          100: '#DCEBE4',
          200: '#BAD5C9',
          300: '#8AA99A',
          400: '#4A7F6C',
          500: '#24614E',
          600: '#1C5443',
          700: '#174C3C', // Deep forest green
          800: '#113A2E',
          900: '#0C2820',
          DEFAULT: '#174C3C',
        },
        sage: {
          50: '#F6F8F7',
          100: '#EBF1EE',
          200: '#D7E3DC',
          300: '#B8CFC4',
          400: '#8AA99A', // Muted sage
          500: '#698B7B',
          600: '#506E60',
          700: '#3D5449',
          DEFAULT: '#8AA99A',
        },
        softTeal: {
          DEFAULT: '#DCEBE4',
          light: '#EEF6F2',
          border: '#C3DCCE',
          dark: '#B1CFBF',
        },
        charcoal: {
          DEFAULT: '#202B27',
          50: '#F4F6F5',
          100: '#E4E7E5',
          200: '#C5CCC8',
          300: '#9BA7A1',
          400: '#6C7B74',
          500: '#4D5B55',
          600: '#38433E',
          700: '#2A332F',
          800: '#202B27', // Dark charcoal
          900: '#131A17',
        },
        warmWhite: '#F7F8F5',
        borderGray: '#E8ECE8',
        cardBg: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"DM Sans"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 76, 60, 0.05), 0 1px 2px 0 rgba(23, 76, 60, 0.03)',
        'card': '0 4px 16px -2px rgba(23, 76, 60, 0.06), 0 2px 6px -1px rgba(23, 76, 60, 0.03)',
        'elevated': '0 12px 28px -4px rgba(23, 76, 60, 0.1), 0 4px 12px -2px rgba(23, 76, 60, 0.04)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
      }
    },
  },
  plugins: [],
}

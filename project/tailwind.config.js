/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6EBF4',
          100: '#C3D0E5',
          200: '#9BB1D6',
          300: '#7491C7',
          400: '#4C72B8',
          500: '#3B5998', // Main primary color
          600: '#324C87',
          700: '#294075',
          800: '#203564',
          900: '#162952',
        },
        accent: {
          50: '#E0F7FC',
          100: '#B3EAF8',
          200: '#80DCF3',
          300: '#4DCFEE',
          400: '#26C1E9',
          500: '#00B4D8', // Main accent color
          600: '#0099C2',
          700: '#007DAB',
          800: '#006294',
          900: '#00467D',
        },
        success: {
          500: '#22C55E',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
        dark: {
          100: '#D1D5DB',
          200: '#9CA3AF',
          300: '#6B7280',
          400: '#4B5563',
          500: '#374151',
          600: '#1F2937',
          700: '#111827',
          800: '#0B111F',
          900: '#030712',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
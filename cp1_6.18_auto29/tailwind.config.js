/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#f0f7f2',
          100: '#d9ebe0',
          200: '#b4d7c0',
          300: '#85bd98',
          400: '#539c6c',
          500: '#2D6B3B',
          600: '#255a32',
          700: '#1f4929',
          800: '#1a3b22',
          900: '#16311d',
        },
        wood: {
          50: '#fdf8f1',
          100: '#f9edd9',
          200: '#f2d8b3',
          300: '#e9be83',
          400: '#df9f4e',
          500: '#D4A76A',
          600: '#c49452',
          700: '#a37743',
          800: '#84603b',
          900: '#6c5033',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

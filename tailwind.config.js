/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f7f7f5',
          100: '#edecea',
          200: '#d9d8d3',
          300: '#b8b6ae',
          400: '#94918a',
          500: '#75726b',
          600: '#5d5b55',
          700: '#4b4944',
          800: '#3e3d39',
          900: '#2d2c29',
          950: '#1a1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

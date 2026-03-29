/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          brown: '#3B1F0A',
          'brown-light': '#5C3317',
          cream: '#F5E6D3',
          'cream-dark': '#E8D0B3',
          gold: '#C8963E',
          'gold-light': '#D9AB5A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

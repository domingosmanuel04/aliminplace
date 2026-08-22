/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#14110F',
        cream: '#F6F1E8',
        gold: '#C4A574',
        forest: '#1F3D32',
        clay: '#8C4A32',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 24px 60px -32px rgba(20,17,15,0.35)',
      },
    },
  },
  plugins: [],
};

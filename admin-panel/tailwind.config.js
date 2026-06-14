/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 600: '#16a34a', 700: '#15803d', 900: '#14532d' },
        sidebar: '#1e293b',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lb: {
          dark:  '#4c8c3f',
          light: '#a1bf37',
          bg:    '#f7faf4',
          text:  '#1a2e17',
          muted: '#5a7a55',
          border:'#d4e8cc',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

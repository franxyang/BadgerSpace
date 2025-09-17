/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        uw: {
          red: '#c5050c',
          dark: '#9b0000',
        },
      },
      borderRadius: {
        'xl2': '1rem',
      }
    },
  },
  plugins: [],
};

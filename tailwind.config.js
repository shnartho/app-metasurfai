/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      './src/**/*.{html,js,jsx,ts,tsx}', // adjust the paths according to your project structure
  ],
  theme: {
      extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  darkMode: 'class',
};

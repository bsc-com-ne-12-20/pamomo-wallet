// filepath: c:\Users\innow\OneDrive\Desktop\pamomo-wallet\tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        scan: 'scan 2s infinite linear',
      },
    },
  },
  plugins: [],
};

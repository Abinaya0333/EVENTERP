/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'cit-blue': '#0a2b4e',
        'cit-blue-light': '#1e3a6b',
        'cit-terracotta': '#c8553d',
        'cit-yellow': '#ffcc00',
        'cit-yellow-dark': '#e6b800',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // "./index.html",
    "./entrypoints/**/*.{js,jsx,ts,tsx}", // This line points to your React components
    "./src/**/*.{js,jsx,ts,tsx}", // This line points to your React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


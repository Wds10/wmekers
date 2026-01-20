/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#121212', // Slightly darker surface for better contrast
        primary: '#8300E9', // Cults3D-like Purple
        secondary: '#00C2FF', // Cyan accent
        text: '#f3f4f6',
        muted: '#9ca3af',
        border: '#27272a',
      }
    },
  },
  plugins: [],
}

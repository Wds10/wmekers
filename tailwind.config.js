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
        surface: '#1a1a1a',
        primary: '#8b5cf6', // Violet
        secondary: '#3b82f6', // Blue
        text: '#f3f4f6',
        muted: '#9ca3af',
        border: '#27272a',
      }
    },
  },
  plugins: [],
}

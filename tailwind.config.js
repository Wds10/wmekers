/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Deep dark (Zinc-950) like Spotify/Modern Apps
        surface: '#18181b', // Slightly lighter (Zinc-900) for cards
        surfaceHighlight: '#27272a', // Hover state
        primary: '#8300E9', // Cults3D Purple (Brand)
        secondary: '#00D2FF', // Futuristic Cyan
        accent: '#1DB954', // Spotify-ish Green for success/action
        text: '#ffffff',
        muted: '#a1a1aa',
        border: '#27272a',
      }
    },
  },
  plugins: [],
}

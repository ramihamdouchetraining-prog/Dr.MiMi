/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0FA3B1',
        secondary: '#1363DF',
        accent: '#F59E0B',
        neutral: '#0B132B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'text': ['Inter', 'sans-serif'],
        'code': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
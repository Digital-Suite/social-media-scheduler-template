/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          background: '#0B0F19',
          surface: '#1A2035',
          border: '#2E3650',
          primary: '#3B82F6',
          primaryHover: '#2563EB',
          text: '#F8FAFC',
          textMuted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

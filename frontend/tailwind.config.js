/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
        },
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
        },
        risk: {
          high: '#DC2626',
          highBg: '#FEF2F2',
          medium: '#D97706',
          mediumBg: '#FFFBEB',
          low: '#2563EB',
          lowBg: '#EFF6FF',
          safe: '#059669',
          safeBg: '#ECFDF5'
        }
      }
    },
  },
  plugins: [],
}

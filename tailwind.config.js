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
        background: '#0F1115',
        'secondary-bg': '#191C22',
        panel: '#20242B',
        tile: '#252A32',
        'tile-hover': '#303640',
        'tile-border': '#30353D',
        'tile-safe': '#202A27',
        'tile-mine': '#3A1D1D',
        primary: {
          DEFAULT: '#18C964',
          hover: '#20E875',
          glow: 'rgba(24, 201, 100, 0.25)',
        },
        accent: {
          gold: '#F5C451',
          red: '#F04444',
          cyan: '#55D6FF',
          gemStart: '#63E6FF',
          gemEnd: '#2799FF',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#8B929D',
          muted: '#5C6370',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-glow': 'pulseGlow 2s infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

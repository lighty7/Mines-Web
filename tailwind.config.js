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
        base: '#0C0E12',
        background: '#0C0E12',
        'secondary-bg': '#13161C',
        panel: '#1A1E26',
        tile: '#222830',
        'tile-hover': '#2C333D',
        'tile-border': '#2E3540',
        'tile-safe': '#202A27',
        'tile-mine': '#3A1D1D',

        surface: {
          1: '#13161C',
          2: '#1A1E26',
          3: '#222830',
          hover: '#2C333D',
        },

        border: {
          subtle: '#252B35',
          default: '#2E3540',
          strong: '#3A424F',
        },

        primary: {
          DEFAULT: '#18C964',
          hover: '#20E875',
          muted: 'rgba(24, 201, 100, 0.15)',
          glow: 'rgba(24, 201, 100, 0.25)',
        },

        status: {
          success: '#18C964',
          danger: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        success: '#18C964',

        accent: {
          gold: '#F5C451',
          red: '#EF4444',
          cyan: '#22D3EE',
          purple: '#A855F7',
          gemStart: '#63E6FF',
          gemEnd: '#2799FF',
        },

        game: {
          mines: '#18C964',
          slots: '#F59E0B',
          roulette: '#EF4444',
          blackjack: '#22D3EE',
          coinflip: '#F5C451',
        },

        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
          disabled: '#475569',
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

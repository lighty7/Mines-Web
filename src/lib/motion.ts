/**
 * Centralized Framer Motion Presets & Game Timing Constants
 */

export const motionPresets = {
  // Button micro-interactions
  buttonHover: { scale: 1.02 },
  buttonTap: { scale: 0.98 },
  chipHover: { scale: 1.08, y: -2 },
  chipTap: { scale: 0.95 },

  // Modal entrance and exit
  modalInitial: { opacity: 0, scale: 0.95, y: 10 },
  modalAnimate: { opacity: 1, scale: 1, y: 0 },
  modalExit: { opacity: 0, scale: 0.95, y: 10 },
  modalTransition: { type: 'spring', stiffness: 300, damping: 25 },

  // Card / element pop-in
  popInInitial: { scale: 0.8, opacity: 0 },
  popInAnimate: { scale: 1, opacity: 1 },
  popInTransition: { type: 'spring', stiffness: 400, damping: 15 },

  // Banner slide down
  slideDownInitial: { opacity: 0, y: -10 },
  slideDownAnimate: { opacity: 1, y: 0 },
  slideDownExit: { opacity: 0, y: -10 },

  // Fade
  fadeInitial: { opacity: 0 },
  fadeAnimate: { opacity: 1 },
  fadeExit: { opacity: 0 },
}

// Unified Timing Constants
export const TIMING = {
  REEL_STOP_NORMAL: [400, 700, 1000, 1300, 1600],
  REEL_STOP_TURBO: [150, 300, 450, 600, 750],
  COIN_FLIP_DURATION: 1100,
  ROULETTE_SPIN_DURATION: 3500,
  TOAST_DURATION: 4000,
  AUTO_SPIN_DELAY: 1000,
}

// Confetti Presets
export const confettiPresets = {
  smallWin: {
    particleCount: 70,
    spread: 60,
    origin: { y: 0.6 },
  },
  bigWin: {
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
  },
  jackpot: {
    particleCount: 200,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#18C964', '#F5C451', '#22D3EE'],
  },
}

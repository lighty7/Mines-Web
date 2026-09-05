# 💣 Mines Web

[![CI](https://github.com/lighty7/Mines-Web/actions/workflows/ci.yml/badge.svg)](https://github.com/lighty7/Mines-Web/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![RTP](https://img.shields.io/badge/RTP-99.0%25-18C964)](https://github.com/lighty7/Mines-Web)

A modern, high-performance, casino-grade **Mines** web application inspired by Stake and Roobet. Features tactile 3D tile flips, zero-latency synthesized Web Audio, responsive multi-grid scaling (3×3 to 8×8), fair odds calculation (99% RTP), dual-mode gameplay (Guest and Authenticated), and seamless integration with the live PostgreSQL backend.

---

## ✨ Features

- **🎮 Dynamic Multi-Grid Engine**:
  - Support for **3×3 (9 tiles)**, **5×5 (25 tiles)**, **6×6 (36 tiles)**, and **8×8 (64 tiles)** grids.
  - Granular mine configuration (from 1 mine up to $N-1$ mines).
  - Real-time mathematical odds calculation and live safe/mine chance percentage display.

- **💎 3D Flipping & Visual Polish**:
  - Hardware-accelerated CSS 3D card flips with backface culling.
  - Glowing animated diamonds and screen-shaking mine detonations.
  - Multi-colored confetti burst on cashout via `canvas-confetti`.

- **🔊 Pure Synthesized Web Audio API**:
  - Zero external `.mp3` or `.wav` dependencies—no 404s, CORS hurdles, or loading lag.
  - Micro-clicks for buttons and bet adjustments.
  - Ascending pentatonic harmonic scale for sequential gem discoveries.
  - Filtered white noise rumble for mine detonations.
  - Tonal arpeggio fanfare for successful cashouts.

- **🌐 Dual-Mode Architecture**:
  - **Guest Mode**: Instant local simulation with 1,000 initial mineCoins. No account or backend connection required.
  - **Authenticated Mode**: Live synchronization with the PostgreSQL Render backend, real-time balance updates, persistent transaction history, and verified profile editing.

- **🔐 Robust Authentication & Account Security**:
  - Sign in and registration with email OTP verification (6-digit code with 60-second cooldown).
  - Forgot password / reset password workflow with OTP validation.
  - Timestamped transaction history with visual `WIN 🏆` and `BET 🎯` badges.

- **⚡ Keyboard Hotkeys & UX**:
  - <kbd>Space</kbd>: Instantly start a new round or cash out current winnings.
  - <kbd>Esc</kbd>: Dismiss any open modal.
  - Quick bet modifiers: **10**, **½**, **2×**, and **MAX**.

---

## 🧮 Multiplier & RTP Mathematics

The game runs on a provably fair **99.0% Return to Player (RTP)** formula matching industry standards:

$$\text{Multiplier}(k) = 0.99 \times \frac{\binom{N}{k}}{\binom{N - M}{k}}$$

Where:
- $N$ = Total board tiles (e.g., 25 for 5×5)
- $M$ = Number of mines placed
- $k$ = Count of successfully revealed safe gems

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Custom Dark Theme tokens) |
| **State Management**| [Zustand](https://github.com/pmndrs/zustand) |
| **Motion & FX** | [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://github.com/catdad/canvas-confetti) |
| **Audio** | Native Browser Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **API Client** | [Axios](https://axios-http.com/) with JWT interceptor and error parsing |
| **CI / CD** | GitHub Actions (Automated verification, typecheck, build, and Pages deployment) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lighty7/Mines-Web.git
   cd Mines-Web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *Default `.env` configuration:*
   ```ini
   VITE_API_URL=https://mines-backend-mex2.onrender.com/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR) |
| `npm run build` | Runs TypeScript compilation (`tsc -b`) and bundles production assets with Vite |
| `npm run preview` | Locally previews the production build from `/dist` |

---

## 📂 Project Structure

```text
Mines-Web/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # GitHub Actions build & verification pipeline
│   │   └── deploy-pages.yml    # GitHub Pages automated deployment
│   └── pull_request_template.md
├── public/
│   └── favicon.svg             # Neon bomb favicon
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance with auth token interceptor
│   │   ├── auth.api.ts         # Login, register, OTP verification, password reset
│   │   ├── game.api.ts         # Start game, reveal tile, cashout
│   │   └── user.api.ts         # Balance sync, profile update, transaction history
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.tsx   # Sign in, register (OTP), forgot password dialog
│   │   ├── game/
│   │   │   ├── Board.tsx       # Dynamic responsive grid & result banner
│   │   │   ├── BettingControls.tsx # Bet input, modifiers, mine slider, odds widget
│   │   │   └── Tile.tsx        # 3D flip card, gem / mine animations
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Balance, audio mute toggle, profile avatar
│   │   │   ├── Footer.tsx      # RTP fair info, how-to-play trigger, copyright
│   │   │   └── HowToPlayModal.tsx # Game rules and hotkey guide
│   │   └── profile/
│   │       └── ProfileModal.tsx # Account editor & timestamped transaction history
│   ├── engine/
│   │   └── minesEngine.ts      # Multiplier, combinatorial odds & local fairness engine
│   ├── hooks/
│   │   └── useAudio.ts         # Web Audio API procedural sound synthesizer
│   ├── store/
│   │   ├── authStore.ts        # Zustand auth state & local storage caching
│   │   └── gameStore.ts        # Zustand game loop, guest fallback & API actions
│   ├── types/
│   │   └── index.ts            # Data models, DTOs, and interface definitions
│   ├── App.tsx                 # Root layout and keyboard shortcut listeners
│   ├── index.css               # Tailwind directives and custom 3D utilities
│   ├── main.tsx                # React DOM mount point
│   └── vite-env.d.ts           # Vite client environment types
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License

MIT © [lighty7](https://github.com/lighty7)

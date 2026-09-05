# Mines Web UI - Architecture & Implementation Plan

## 1. Executive Summary & Goals
The objective is to build a modern, high-performance, dark-themed casino-grade **Mines Web Application** inside `F:\Hmmm1\Mines-Web`.

The web application will:
* Connect seamlessly to the existing live Render backend: `https://mines-backend-mex2.onrender.com`.
* Replicate the visual identity, colors, and audio responsiveness of the Android app.
* Support both **Guest Mode** (instant local play with 1,000 fake mineCoins) and **Authenticated Mode** (live PostgreSQL balance, email OTP registration, password reset, and transaction history).
* Be fully responsive across desktop, tablet, and mobile browsers.

---

## 2. Tech Stack

| Category | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **React 18 / 19 + Vite + TypeScript** | Ultra-fast HMR, lightweight bundle, instant static build, full type safety sharing backend DTOs. |
| **Styling** | **Tailwind CSS + PostCSS** | Rapid styling matching exact color tokens from the Android theme (`#0F1115`, `#20242B`, `#252A32`, `#18C964`). |
| **Animation** | **Framer Motion** | 3D tile flips, gem glows, board shake on mine explosions, multiplier badge pops. |
| **Audio** | **Howler.js / Web Audio API** | Reliable audio synthesis/playback for clicks, consecutive gem dings with ascending pitch, explosion, and cashout chime. |
| **State Management** | **Zustand** | Lightweight global store for wallet balance, active round, game status, and JWT tokens (persisted in `localStorage`). |
| **Icons** | **Lucide React** | High-quality, modern SVG icons for wallet, sound, profile, settings, and navigation. |
| **Visual Effects** | **canvas-confetti** | High-performance particle celebration upon profitable cashouts. |
| **HTTP Client** | **Axios** | Interceptors for auto-injecting `Authorization: Bearer <token>` and standardized error parsing. |

---

## 3. UI/UX Layout & Design System

### 3.1 Theme & Color Palette
* **Background**: `#0F1115` (Deep space black)
* **Panel / Sidebar**: `#20242B` (Elevated dark slate)
* **Tile (Default)**: `#252A32` with border `#30353D` and hover `#303640`
* **Safe Tile (Diamond)**: Cyan-to-Emerald glow (`#18C964` / `#55D6FF`)
* **Mine Tile (Explosion)**: Crimson burst (`#F04444` / `#3A1D1D`)
* **Primary Accent / Win**: Neon Emerald Green (`#18C964`)
* **Secondary Accent / Cashout**: Gold (`#F5C451`)
* **Text**: Primary `#F5F7FA`, Secondary `#8B929D`

### 3.2 Responsive Wireframe
```
+-----------------------------------------------------------------------------------------------+
|  [💣 MINES]                        [🪙 1,000.00 mineCoin]  [🔊]  [👤 Player_123]  [⚙️]         |
+-----------------------------------------------------------------------------------------------+
|                                     |                                                         |
|  LEFT PANEL: BETTING CONTROLS       |               CENTER: INTERACTIVE GAME BOARD            |
|                                     |                                                         |
|  • Bet Amount (mineCoin):           |    +-------+ +-------+ +-------+ +-------+ +-------+    |
|    [  10.00  ] [1/2] [2x] [Max]     |    |   💎  | |   ❓  | |   💎  | |   ❓  | |   ❓  |    |
|                                     |    +-------+ +-------+ +-------+ +-------+ +-------+    |
|  • Mines Count:                     |    |   ❓  | |   💎  | |   ❓  | |   💥  | |   ❓  |    |
|    [ 5 ▾ ] (Slider 1 to 24)         |    +-------+ +-------+ +-------+ +-------+ +-------+    |
|                                     |    |   ❓  | |   ❓  | |   💎  | |   ❓  | |   💎  |    |
|  • Grid Size:                       |    +-------+ +-------+ +-------+ +-------+ +-------+    |
|    [ 3x3 ] [ 5x5 ] [ 6x6 ] [ 8x8 ]  |    |   ❓  | |   💎  | |   ❓  | |   ❓  | |   ❓  |    |
|                                     |    +-------+ +-------+ +-------+ +-------+ +-------+    |
|  • Round Stats:                     |    |   💎  | |   ❓  | |   ❓  | |   💎  | |   ❓  |    |
|    Gems Found: 4/20                 |    +-------+ +-------+ +-------+ +-------+ +-------+    |
|    Current Multiplier: 1.48x        |                                                         |
|    Potential Payout: 14.80          |    Current: 1.48x (+14.80)  |  Next Tile: 1.85x (+18.50)|
|                                     |                                                         |
|  • Main Action Button:              +---------------------------------------------------------+
|    [   START GAME (BET 10)   ]      |                                                         |
|    -or during active game-          |    HOTKEYS: [Space] Cashout   [R] Random Tile           |
|    [   CASHOUT 14.80 (1.48x) ]      |                                                         |
+-------------------------------------+---------------------------------------------------------+
|  FOOTER TABS: [ 📜 Live Game History ]   [ 📋 My Transactions ]   [ ❓ How to Play ]          |
+-----------------------------------------------------------------------------------------------+
```

---

## 4. Key Functional Modules

### 4.1 Game Engine & Gameplay
* **Fairness / Multiplier Engine**:
  * Accurate mathematical multipliers mirroring the backend:
    $$\text{multiplier} = 0.99 \times \frac{\binom{N}{k}}{\binom{N - M}{k}}$$
  * Dynamic calculation of safe tile chance $\%$ and mine probability $\%$.
* **Interactive Grid**:
  * 3D card-flip reveal effect using Framer Motion.
  * Consecutive safe diamond sound effect with pitch increasing per reveal (1.0x -> 1.1x -> 1.2x etc.).
  * Mine reveal triggering board shake, red screen flash, and unmasking of all remaining mine locations.
  * Keyboard accessibility (Space to Cashout, Enter to Bet).

### 4.2 Authentication & OTP Verification
* **Guest Mode**:
  * Instant access with 1,000 local mineCoins. Allows playing completely offline or before registration.
* **Sign In Form**:
  * Email + Password authentication.
  * "Forgot Password?" link triggering the reset flow.
* **Registration with Email OTP**:
  * Input fields: Username (alphanumeric + underscores only, 3–24 chars), Email, Password, Optional Address.
  * Step 1: User enters details -> clicks "Send Verification Code" -> calls `POST /api/auth/send-otp`.
  * Step 2: Enters 6-digit OTP code with 60-second resend countdown timer.
  * Step 3: Taps "Verify & Complete Registration" -> calls `POST /api/auth/verify-otp` and registers the user.
* **Forgot Password Flow**:
  * Step 1: Input registered email -> `POST /api/auth/send-otp` (reason: `"password reset"`).
  * Step 2: Input 6-digit OTP + New Password -> calls `POST /api/auth/reset-password`.

### 4.3 Profile & Transaction History
* **Profile Drawer / Modal**:
  * Displays user avatar, verified email, live PostgreSQL balance.
  * Editable username and residential address (`PUT /api/user/profile`).
  * Logout button clearing JWT and restoring guest session.
* **Transaction History Tab**:
  * Real-time list from `GET /api/user/transactions`.
  * Badges for `WIN 🏆` (green `+amount`) and `BET 🎯` (red `-amount`).
  * Formatted date & time (`dd MMM yyyy, hh:mm a`).
  * Refresh button with loading spinner.

---

## 5. Directory Structure in `F:\Hmmm1\Mines-Web`

```
F:\Hmmm1\Mines-Web\
├── public/
│   ├── favicon.svg
│   └── sounds/              # Audio assets (click, diamond, boom, cashout)
├── src/
│   ├── api/
│   │   ├── client.ts        # Axios client with JWT interceptor & base URL
│   │   ├── auth.api.ts      # Login, register, send-otp, verify-otp, reset-pw
│   │   ├── game.api.ts      # Start, reveal, cashout
│   │   └── user.api.ts      # Balance, profile, transactions
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx
│   │   │   ├── SignInTab.tsx
│   │   │   ├── RegisterTab.tsx
│   │   │   └── ForgotPasswordModal.tsx
│   │   ├── game/
│   │   │   ├── Board.tsx
│   │   │   ├── Tile.tsx
│   │   │   ├── BettingControls.tsx
│   │   │   ├── MultiplierBadge.tsx
│   │   │   └── ResultBanner.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── profile/
│   │   │   ├── ProfileModal.tsx
│   │   │   └── TransactionHistoryTab.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── engine/
│   │   └── minesEngine.ts   # Local multiplier & odds math engine
│   ├── hooks/
│   │   ├── useAudio.ts      # Web audio / sound effects hook
│   │   ├── useGame.ts       # Main gameplay lifecycle logic
│   │   └── useKeyboard.ts   # Space/Enter hotkeys
│   ├── store/
│   │   ├── authStore.ts     # User profile, JWT token, guest status
│   │   └── gameStore.ts     # Active round, balance, tiles, multiplier
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces (matching backend DTOs)
│   ├── App.tsx
│   ├── index.css            # Tailwind directives and custom animations
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Implementation Roadmap

### Phase 1: Project Setup & Tailwind Dark Theme
1. Initialize Vite project with React + TypeScript in `F:\Hmmm1\Mines-Web`.
2. Configure Tailwind CSS with the custom Mines casino color palette.
3. Configure Axios API client with environment variable `VITE_API_URL=https://mines-backend-mex2.onrender.com`.

### Phase 2: State Store & Sound System
1. Implement Zustand stores (`authStore.ts` and `gameStore.ts`).
2. Build `useAudio` hook with synthetic Web Audio chimes and sound effects.

### Phase 3: Game Board & Betting Controls
1. Build interactive grid (`Board.tsx` & `Tile.tsx`) supporting 3x3, 5x5, 6x6, 8x8.
2. Build Betting Controls (Bet input, quick multipliers `1/2`, `2x`, `Max`, Mines slider).
3. Connect start round, reveal tile, and cash out flows with Framer Motion animations.

### Phase 4: Authentication & OTP Verification
1. Build `AuthModal.tsx` with Sign In, Register, and Forgot Password views.
2. Implement 6-digit OTP code verification with 60s countdown timer.

### Phase 5: Profile & Transactions History
1. Build Profile & Wallet view with balance sync.
2. Build Transaction History table with formatted timestamps, `WIN` / `BET` badges, and refresh button.

### Phase 6: Polish & Mobile Optimization
1. Add `canvas-confetti` on cashout wins.
2. Ensure touch-friendly layout for mobile viewports.
3. Build and test production bundle (`npm run build`).

---

## 7. Deployment & Hosting
* **Target**: Free hosting on **Vercel** or **Cloudflare Pages**.
* **Live API**: Configured with CORS for frontend origin pointing to `https://mines-backend-mex2.onrender.com`.

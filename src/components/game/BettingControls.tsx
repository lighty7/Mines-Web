import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { MinesEngine } from '../../engine/minesEngine'
import { Bomb, Grid, Coins, Percent, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

export const BettingControls: React.FC = () => {
  const {
    bet,
    setBet,
    mines,
    setMines,
    boardSize,
    gridDimension,
    setGridDimension,
    gameState,
    isLoading,
    errorMessage,
    clearError,
    startGame,
    cashout,
    revealedCount,
    multiplier,
    potentialWin,
  } = useGameStore()

  const { user } = useAuthStore()
  const { playClick, playCashout } = useAudio()

  const isActive = gameState === 'ACTIVE'
  const maxMines = boardSize - 1
  const safeTilesRemaining = boardSize - mines - revealedCount

  // Next tile multiplier calculation
  const nextMultiplier = isActive
    ? MinesEngine.calculateMultiplier(boardSize, mines, revealedCount + 1)
    : MinesEngine.calculateMultiplier(boardSize, mines, 1)

  const nextPayout = Math.floor(bet * nextMultiplier * 100) / 100
  const mineChance = MinesEngine.mineChancePercentage(boardSize, mines, revealedCount)
  const safeChance = MinesEngine.safeChancePercentage(boardSize, mines, revealedCount)

  const handleStartOrCashout = async () => {
    playClick()
    if (isActive) {
      if (revealedCount === 0) return
      const result = await cashout()
      if (result) {
        playCashout()
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    } else {
      await startGame()
    }
  }

  const handleBetChange = (newVal: number) => {
    playClick()
    clearError()
    setBet(newVal)
  }

  return (
    <div className="w-full flex flex-col gap-4 bg-panel/80 border border-tile-border rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Error Message Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-red/15 border border-accent-red/40 text-accent-red text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={clearError} className="font-bold hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Grid Dimension Tabs */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-primary" />
          Grid Size
        </label>
        <div className="grid grid-cols-4 gap-1.5 bg-tile p-1 rounded-xl border border-tile-border">
          {[3, 5, 6, 8].map((dim) => (
            <button
              key={dim}
              type="button"
              disabled={isActive || isLoading}
              onClick={() => {
                playClick()
                setGridDimension(dim)
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                gridDimension === dim
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-tile-hover disabled:opacity-50'
              }`}
            >
              {dim}x{dim}
            </button>
          ))}
        </div>
      </div>

      {/* Bet Amount Input with Quick Modifiers */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-accent-gold" />
            Bet Amount (mineCoin)
          </label>
          <span className="text-[11px] text-text-secondary">
            Max: {user.balance.toFixed(2)}
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="number"
            min="1"
            max={user.balance}
            step="1"
            disabled={isActive || isLoading}
            value={bet}
            onChange={(e) => handleBetChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
          />
        </div>

        {/* Quick Multiplier Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mt-1">
          <button
            type="button"
            disabled={isActive || isLoading}
            onClick={() => handleBetChange(10)}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-tile hover:bg-tile-hover border border-tile-border text-text-secondary hover:text-text-primary transition-all disabled:opacity-50"
          >
            10
          </button>
          <button
            type="button"
            disabled={isActive || isLoading}
            onClick={() => handleBetChange(Math.max(1, Math.floor(bet / 2)))}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-tile hover:bg-tile-hover border border-tile-border text-text-secondary hover:text-text-primary transition-all disabled:opacity-50"
          >
            ½
          </button>
          <button
            type="button"
            disabled={isActive || isLoading}
            onClick={() => handleBetChange(Math.min(user.balance, bet * 2))}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-tile hover:bg-tile-hover border border-tile-border text-text-secondary hover:text-text-primary transition-all disabled:opacity-50"
          >
            2×
          </button>
          <button
            type="button"
            disabled={isActive || isLoading}
            onClick={() => handleBetChange(user.balance)}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-tile hover:bg-tile-hover border border-tile-border text-text-secondary hover:text-text-primary transition-all disabled:opacity-50"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Mines Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Bomb className="w-3.5 h-3.5 text-accent-red" />
            Mines Count
          </label>
          <span className="text-xs font-mono font-bold text-accent-red">
            {mines} / {boardSize} tiles
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max={maxMines}
            step="1"
            disabled={isActive || isLoading}
            value={mines}
            onChange={(e) => {
              playClick()
              setMines(parseInt(e.target.value, 10))
            }}
            className="w-full h-2 bg-tile rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
          />
          <span className="w-9 h-8 rounded-lg bg-tile border border-tile-border flex items-center justify-center font-mono font-bold text-xs text-text-primary flex-shrink-0">
            {mines}
          </span>
        </div>
      </div>

      {/* Probability & Multiplier Stats Widget */}
      <div className="p-3 rounded-xl bg-tile border border-tile-border flex flex-col gap-2 shadow-inner">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-primary" />
            Safe / Mine Chance
          </span>
          <span className="font-mono text-xs font-bold">
            <span className="text-primary">{safeChance.toFixed(1)}%</span>
            <span className="text-text-secondary mx-1">/</span>
            <span className="text-accent-red">{mineChance.toFixed(1)}%</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Next Multiplier</span>
          <span className="font-mono font-bold text-accent-gold">
            {nextMultiplier.toFixed(2)}x ({nextPayout.toFixed(2)} mineCoin)
          </span>
        </div>

        {isActive && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-tile-border/40">
            <span className="text-text-secondary">Safe Remaining</span>
            <span className="font-mono font-bold text-text-primary">{safeTilesRemaining}</span>
          </div>
        )}
      </div>

      {/* Main Action Button (BET / CASHOUT) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading || (isActive && revealedCount === 0)}
        onClick={handleStartOrCashout}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-xl ${
          isActive
            ? revealedCount > 0
              ? 'bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold text-black shadow-accent-gold/25 hover:brightness-105 animate-pulse-glow'
              : 'bg-tile border border-tile-border text-text-secondary cursor-not-allowed opacity-80'
            : 'bg-primary hover:bg-primary-hover text-black shadow-primary/25'
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isActive ? (
          revealedCount > 0 ? (
            <div className="flex flex-col items-center leading-none">
              <span className="text-xs uppercase tracking-wider font-extrabold">CASHOUT</span>
              <span className="text-base font-mono font-black mt-0.5">
                {potentialWin.toFixed(2)} mineCoin ({multiplier.toFixed(2)}x)
              </span>
            </div>
          ) : (
            <span>SELECT A TILE</span>
          )
        ) : (
          <div className="flex items-center gap-2">
            <span>START GAME</span>
            <span className="text-xs font-mono font-normal opacity-80">({bet} mineCoin)</span>
          </div>
        )}
      </motion.button>
    </div>
  )
}

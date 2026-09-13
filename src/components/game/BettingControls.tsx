import React from 'react'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { MinesEngine } from '../../engine/minesEngine'
import { Bomb, Grid, Coins, Percent, Play, ArrowDownCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Alert } from '../ui/Alert'
import { Tabs } from '../ui/Tabs'
import { Input } from '../ui/Input'
import { QuickBetGrid } from '../ui/QuickBetGrid'
import { Button } from '../ui/Button'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'
import { confettiPresets } from '../../lib/motion'

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
        confetti(confettiPresets.bigWin)
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

  const gridTabs = [
    { id: '4', label: '4x4' },
    { id: '5', label: '5x5' },
    { id: '6', label: '6x6' },
  ]

  return (
    <div className="w-full flex flex-col gap-4 bg-surface-2/90 border border-border-default rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Error Alert Banner */}
      {errorMessage && (
        <Alert variant="error" onDismiss={clearError}>
          {errorMessage}
        </Alert>
      )}

      {/* Grid Dimension Tabs */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-primary" />
          Grid Dimension
        </label>
        <Tabs
          items={gridTabs}
          activeTab={String(gridDimension)}
          onChange={(val) => {
            if (!isActive && !isLoading) {
              playClick()
              setGridDimension(Number(val))
            }
          }}
          size="sm"
        />
      </div>

      {/* Bet Amount Input with Quick Modifiers */}
      <div className="flex flex-col gap-1.5">
        <Input
          label="Bet Amount"
          labelRight={
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <span>Balance:</span>
              <CurrencyDisplay amount={user.balance} size="xs" />
            </div>
          }
          type="number"
          min="1"
          max={user.balance}
          step="1"
          disabled={isActive || isLoading}
          value={bet}
          onChange={(e) => handleBetChange(parseFloat(e.target.value) || 0)}
          leftIcon={<Coins className="w-4 h-4 text-accent-gold" />}
          suffix="MC"
        />

        {/* Quick Bet Buttons */}
        <QuickBetGrid
          currentBet={bet}
          balance={user.balance}
          onBetChange={handleBetChange}
          presets={[10, 25, 50, 100]}
          disabled={isActive || isLoading}
        />
      </div>

      {/* Mines Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Bomb className="w-3.5 h-3.5 text-danger" />
            Mines Count
          </label>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-danger/15 border border-danger/30 text-danger font-mono font-bold text-xs">
              {mines} {mines === 1 ? 'Mine' : 'Mines'}
            </span>
            <span className="text-[11px] text-text-muted">
              ({safeTilesRemaining} Safe)
            </span>
          </div>
        </div>

        {/* Steppers and Range Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Decrease Mines"
            disabled={isActive || isLoading || mines <= 1}
            onClick={() => {
              playClick()
              setMines(mines - 1)
            }}
            className="w-8 h-8 rounded-lg bg-surface-3 hover:bg-surface-hover border border-border-default flex items-center justify-center font-bold text-base text-text-secondary hover:text-text-primary active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex-shrink-0 cursor-pointer"
          >
            -
          </button>

          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="1"
              max={maxMines}
              step="1"
              disabled={isActive || isLoading}
              value={mines}
              style={{
                background: `linear-gradient(to right, #18C964 0%, #F5C451 ${Math.min(
                  ((mines - 1) / (maxMines - 1)) * 100,
                  60
                )}%, #EF4444 ${((mines - 1) / (maxMines - 1)) * 100}%, #2A303C ${
                  ((mines - 1) / (maxMines - 1)) * 100
                }%, #2A303C 100%)`,
              }}
              onChange={(e) => {
                playClick()
                setMines(parseInt(e.target.value, 10))
              }}
              className="mines-slider"
            />
          </div>

          <button
            type="button"
            title="Increase Mines"
            disabled={isActive || isLoading || mines >= maxMines}
            onClick={() => {
              playClick()
              setMines(mines + 1)
            }}
            className="w-8 h-8 rounded-lg bg-surface-3 hover:bg-surface-hover border border-border-default flex items-center justify-center font-bold text-base text-text-secondary hover:text-text-primary active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex-shrink-0 cursor-pointer"
          >
            +
          </button>

          <div className="w-10 h-8 rounded-lg bg-surface-3 border border-primary/50 flex items-center justify-center font-mono font-bold text-xs text-primary flex-shrink-0 shadow-inner">
            {mines}
          </div>
        </div>

        {/* Quick Mine Count Presets */}
        <div className="grid grid-cols-5 gap-1.5 mt-0.5">
          {[1, 3, 5, 10, maxMines].map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={isActive || isLoading}
              onClick={() => {
                playClick()
                setMines(preset)
              }}
              className={`py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                mines === preset
                  ? 'bg-danger/20 border-danger/60 text-danger shadow-sm'
                  : 'bg-surface-3 hover:bg-surface-hover border-border-default text-text-secondary hover:text-text-primary disabled:opacity-50'
              }`}
            >
              {preset === maxMines ? 'MAX' : `${preset}💣`}
            </button>
          ))}
        </div>
      </div>

      {/* Probability & Multiplier Stats Widget */}
      <div className="p-3.5 rounded-xl bg-surface-3 border border-border-default flex flex-col gap-2 shadow-inner">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-primary" />
            Safe / Mine Odds
          </span>
          <span className="font-mono text-xs font-bold">
            <span className="text-primary">{safeChance.toFixed(1)}%</span>
            <span className="text-text-muted mx-1">/</span>
            <span className="text-danger">{mineChance.toFixed(1)}%</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Next Multiplier</span>
          <span className="font-mono font-bold text-accent-gold">
            {nextMultiplier.toFixed(2)}x ({nextPayout.toFixed(2)} MC)
          </span>
        </div>

        {isActive && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
            <span className="text-text-secondary">Safe Remaining</span>
            <span className="font-mono font-bold text-text-primary">{safeTilesRemaining}</span>
          </div>
        )}
      </div>

      {/* Main Action Button (BET / CASHOUT) */}
      {isActive ? (
        <Button
          variant={revealedCount > 0 ? 'gold' : 'secondary'}
          size="xl"
          fullWidth
          disabled={isLoading || revealedCount === 0}
          onClick={handleStartOrCashout}
          isLoading={isLoading}
          leftIcon={revealedCount > 0 ? <ArrowDownCircle className="w-5 h-5" /> : undefined}
        >
          {revealedCount > 0 ? (
            <div className="flex flex-col items-center leading-none">
              <span className="text-xs uppercase tracking-wider font-extrabold">CASHOUT</span>
              <span className="text-base font-mono font-black mt-0.5">
                {potentialWin.toFixed(2)} MC ({multiplier.toFixed(2)}x)
              </span>
            </div>
          ) : (
            <span>SELECT A TILE</span>
          )}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="xl"
          fullWidth
          disabled={isLoading || user.balance < bet}
          onClick={handleStartOrCashout}
          isLoading={isLoading}
          leftIcon={<Play className="w-5 h-5 fill-current" />}
        >
          <span>START GAME ({bet} MC)</span>
        </Button>
      )}
    </div>
  )
}

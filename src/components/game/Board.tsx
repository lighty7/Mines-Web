import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { Tile } from './Tile'
import { useAudio } from '../../hooks/useAudio'
import confetti from 'canvas-confetti'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'
import { confettiPresets } from '../../lib/motion'

export const Board: React.FC = () => {
  const {
    tiles,
    gridDimension,
    gameState,
    isLoading,
    revealTile,
    revealedCount,
    multiplier,
    potentialWin,
    lastResult,
  } = useGameStore()

  const { playDiamond, playExplosion, playCashout } = useAudio()

  const handleTileClick = async (index: number) => {
    const result = await revealTile(index)
    if (!result) return

    if (result.safe) {
      playDiamond(revealedCount)
      if (result.gameOver) {
        // Full board cleared!
        playCashout()
        confetti(confettiPresets.jackpot)
      }
    } else {
      playExplosion()
    }
  }

  // Dynamic Tailwind grid column class
  const gridColClass = {
    4: 'grid-cols-4 max-w-sm sm:max-w-md',
    5: 'grid-cols-5 max-w-md sm:max-w-lg',
    6: 'grid-cols-6 max-w-lg sm:max-w-xl',
  }[gridDimension] || 'grid-cols-5 max-w-md sm:max-w-lg'

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* Board Container with subtle border and inner shadow */}
      <div className="w-full flex flex-col items-center p-4 sm:p-6 bg-surface-2/70 border border-border-default rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full" />

        {/* Live Multiplier Floating Header */}
        {gameState === 'ACTIVE' && revealedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-1.5 rounded-full bg-surface-3/90 border border-primary/40 flex items-center gap-3 shadow-lg shadow-primary/10"
          >
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <span>Gems:</span>
              <span className="font-bold text-primary font-mono">{revealedCount}</span>
            </div>
            <span className="text-border-default">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Multiplier:</span>
              <span className="text-sm font-extrabold font-mono text-primary animate-pulse">
                {multiplier.toFixed(2)}x
              </span>
            </div>
            <span className="text-border-default">•</span>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <span>Profit:</span>
              <CurrencyDisplay amount={potentialWin} size="xs" className="text-accent-gold font-mono" />
            </div>
          </motion.div>
        )}

        {/* Grid Container */}
        <div className={`grid ${gridColClass} gap-2 sm:gap-2.5 w-full aspect-square relative z-10`}>
          {tiles.map((tile) => (
            <Tile
              key={tile.index}
              tile={tile}
              gameState={gameState}
              disabled={gameState !== 'ACTIVE' || isLoading}
              onClick={() => handleTileClick(tile.index)}
            />
          ))}
        </div>

        {/* End of Game Overlay Banner */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/75 backdrop-blur-md transition-all"
            >
              {lastResult.won ? (
                <div className="flex flex-col items-center text-center p-6 bg-surface-2 border-2 border-primary/60 rounded-3xl shadow-2xl shadow-primary/20 max-w-xs sm:max-w-sm animate-pop">
                  <span className="text-5xl mb-2 select-none">🏆</span>
                  <span className="text-xs uppercase tracking-widest text-primary font-black">
                    CASHOUT SUCCESS
                  </span>
                  <div className="my-1">
                    <CurrencyDisplay
                      amount={lastResult.payout}
                      size="xl"
                      showSign
                      className="text-primary"
                    />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-mono font-bold text-primary my-2">
                    {lastResult.multiplier.toFixed(2)}x Multiplier
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Credited directly to your wallet balance.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-6 bg-surface-2 border-2 border-danger/60 rounded-3xl shadow-2xl shadow-danger/20 max-w-xs sm:max-w-sm animate-shake">
                  <span className="text-5xl mb-2 select-none">💥</span>
                  <span className="text-xs uppercase tracking-widest text-danger font-black">
                    MINE DETONATED
                  </span>
                  <h3 className="text-2xl font-extrabold text-text-primary my-1">
                    Round Lost
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Better luck next round! Adjust your bet or mines count.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, AlertCircle } from 'lucide-react'
import { Reel } from './Reel'
import { useSlotStore } from '../../store/slotStore'
import { useAudio } from '../../hooks/useAudio'
import { SpinResult } from '../../types/slots'

interface SlotMachineProps {
  onSpinRequest: () => Promise<SpinResult | null>
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ onSpinRequest }) => {
  const {
    grid,
    isSpinning,
    winningLines,
    freeSpinsRemaining,
    autoSpin,
    turboMode,
    errorMessage,
    clearError,
  } = useSlotStore()

  const { playReelSpin, playReelStop, playSlotWin } = useAudio()

  // Individual reel stop state (reel 0..4)
  const [reelStopped, setReelStopped] = useState<boolean[]>([true, true, true, true, true])
  const [activeWinningLineIdx, setActiveWinningLineIdx] = useState<number | null>(null)
  const autoSpinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Trigger spin with staggered reel stops
  const handleExecuteSpin = useCallback(async () => {
    if (isSpinning) return
    clearError()
    setReelStopped([false, false, false, false, false])
    setActiveWinningLineIdx(null)

    // Start reel spin sound ticking
    playReelSpin()
    spinIntervalRef.current = setInterval(() => {
      playReelSpin()
    }, 180)

    const result = await onSpinRequest()

    // Stop audio ticking
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current)
      spinIntervalRef.current = null
    }

    if (!result) {
      setReelStopped([true, true, true, true, true])
      return
    }

    // Staggered reel stops
    const stopDelays = turboMode ? [150, 300, 450, 600, 750] : [400, 700, 1000, 1300, 1600]

    stopDelays.forEach((delay, reelIdx) => {
      setTimeout(() => {
        setReelStopped((prev) => {
          const next = [...prev]
          next[reelIdx] = true
          return next
        })
        playReelStop(reelIdx)

        // All 5 reels stopped
        if (reelIdx === 4) {
          useSlotStore.setState({ isSpinning: false })

          if (result.payout > 0) {
            playSlotWin(result.totalMultiplier)
            if (result.totalMultiplier >= 10 || result.freeSpinsWon > 0) {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.55 },
              })
            }
          }
        }
      }, delay)
    })
  }, [isSpinning, turboMode, onSpinRequest, clearError, playReelSpin, playReelStop, playSlotWin])

  // Cycle through winning lines visually
  useEffect(() => {
    if (winningLines.length === 0 || isSpinning) {
      setActiveWinningLineIdx(null)
      return
    }

    let current = 0
    setActiveWinningLineIdx(0)

    const interval = setInterval(() => {
      current = (current + 1) % winningLines.length
      setActiveWinningLineIdx(current)
    }, 1800)

    return () => clearInterval(interval)
  }, [winningLines, isSpinning])

  // Handle Auto-spin loop
  useEffect(() => {
    if (autoSpin && !isSpinning) {
      autoSpinTimerRef.current = setTimeout(() => {
        handleExecuteSpin()
      }, 1000)
    }

    return () => {
      if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current)
    }
  }, [autoSpin, isSpinning, handleExecuteSpin])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
      if (autoSpinTimerRef.current) clearTimeout(autoSpinTimerRef.current)
    }
  }, [])

  // Calculate which rows in each reel are currently winning
  const getWinningRowsForReel = (reelIdx: number): number[] => {
    if (isSpinning || winningLines.length === 0) return []
    const line = activeWinningLineIdx !== null ? winningLines[activeWinningLineIdx] : null
    if (!line) return []

    const winningInThisReel: number[] = []
    line.positions.forEach((pos) => {
      if (pos.reel === reelIdx) {
        winningInThisReel.push(pos.row)
      }
    })
    return winningInThisReel
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Error notification */}
      {errorMessage && (
        <div className="w-full max-w-2xl p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={clearError} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Slot Machine Chassis */}
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#1c2028] via-[#14171d] to-[#0d0f13] border-2 border-tile-border rounded-3xl p-4 sm:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col gap-4">
        {/* Top Header Marquee */}
        <div className="flex items-center justify-between px-4 py-2 bg-tile/60 border border-tile-border/50 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎰</span>
            <span className="text-sm font-black tracking-widest text-white uppercase">
              Neon Rush Slots
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {freeSpinsRemaining > 0 ? (
              <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full font-bold">
                {freeSpinsRemaining} FREE SPINS
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded-full font-bold">
                96.5% RTP
              </span>
            )}
          </div>
        </div>

        {/* 5 Reels Container */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-black/60 p-2 sm:p-3 rounded-2xl border border-tile-border/80">
          {[0, 1, 2, 3, 4].map((reelIdx) => (
            <Reel
              key={reelIdx}
              reelIndex={reelIdx}
              symbols={grid[reelIdx] || [0, 1, 2]}
              isSpinning={isSpinning}
              isStopped={reelStopped[reelIdx]}
              winningRows={getWinningRowsForReel(reelIdx)}
            />
          ))}
        </div>

        {/* Bottom Status / Win Notification Ribbon */}
        <div className="min-h-[48px] px-4 py-2 bg-tile/40 border border-tile-border/50 rounded-2xl flex items-center justify-between">
          {winningLines.length > 0 && !isSpinning ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-white">
                  Line #{winningLines[activeWinningLineIdx || 0]?.lineIndex + 1}:{' '}
                  <span className="text-primary font-mono">
                    {winningLines[activeWinningLineIdx || 0]?.matchCount}×{' '}
                    {winningLines[activeWinningLineIdx || 0]?.symbolName}
                  </span>
                </span>
              </div>
              <div className="text-xs font-mono font-extrabold text-primary">
                +{winningLines[activeWinningLineIdx || 0]?.payout.toFixed(2)} mineCoins
              </div>
            </motion.div>
          ) : isSpinning ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>GOOD LUCK! ROLLING REELS...</span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between text-xs text-text-secondary">
              <span>Select your bet and lines, then press SPIN to play!</span>
              <span className="font-mono text-text-primary font-bold">20 PAYLINES</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

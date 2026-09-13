import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-react'
import { Reel } from './Reel'
import { useSlotStore } from '../../store/slotStore'
import { useAudio } from '../../hooks/useAudio'
import { SpinResult } from '../../types/slots'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'
import { TIMING, confettiPresets } from '../../lib/motion'

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
    setIsSpinning,
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

    // Staggered reel stops using centralized TIMING constants
    const stopDelays = turboMode ? TIMING.REEL_STOP_TURBO : TIMING.REEL_STOP_NORMAL

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
          setIsSpinning(false)

          if (result.payout > 0) {
            playSlotWin(result.totalMultiplier)
            if (result.totalMultiplier >= 10 || result.freeSpinsWon > 0) {
              confetti(confettiPresets.bigWin)
            }
          }
        }
      }, delay)
    })
  }, [isSpinning, turboMode, onSpinRequest, clearError, setIsSpinning, playReelSpin, playReelStop, playSlotWin])

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
      }, TIMING.AUTO_SPIN_DELAY)
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
        <div className="w-full max-w-2xl">
          <Alert variant="error" onDismiss={clearError}>
            {errorMessage}
          </Alert>
        </div>
      )}

      {/* Main Slot Machine Chassis */}
      <div className="relative w-full max-w-3xl bg-surface-2/80 border border-border-default rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 backdrop-blur-md">
        {/* Top Header Marquee */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-3/60 border border-border-default rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">🎰</span>
            <span className="text-sm font-black tracking-widest text-text-primary uppercase">
              Neon Rush Slots
            </span>
          </div>

          <div className="flex items-center gap-2">
            {freeSpinsRemaining > 0 ? (
              <Badge variant="warning" size="sm" dot pulseDot>
                {freeSpinsRemaining} Free Spins
              </Badge>
            ) : (
              <Badge variant="primary" size="sm">
                96.5% RTP
              </Badge>
            )}
          </div>
        </div>

        {/* 5 Reels Container */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-surface-1/90 p-2 sm:p-3 rounded-2xl border border-border-default/80">
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
        <div className="min-h-[48px] px-4 py-2 bg-surface-3/50 border border-border-default rounded-2xl flex items-center justify-between">
          {winningLines.length > 0 && !isSpinning ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-text-primary">
                  Line #{winningLines[activeWinningLineIdx || 0]?.lineIndex + 1}:{' '}
                  <span className="text-primary font-mono">
                    {winningLines[activeWinningLineIdx || 0]?.matchCount}×{' '}
                    {winningLines[activeWinningLineIdx || 0]?.symbolName}
                  </span>
                </span>
              </div>
              <div>
                <CurrencyDisplay
                  amount={winningLines[activeWinningLineIdx || 0]?.payout || 0}
                  size="sm"
                  showSign
                  className="text-primary"
                />
              </div>
            </motion.div>
          ) : isSpinning ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>SPINNING REELS...</span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between text-xs text-text-secondary">
              <span>Set bet per line and press SPIN or SPACE!</span>
              <span className="font-mono text-text-primary font-bold">20 PAYLINES</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

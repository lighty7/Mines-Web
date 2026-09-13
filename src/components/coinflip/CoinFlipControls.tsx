import React from 'react'
import { motion } from 'framer-motion'
import { Coins, CheckCircle, ArrowRight } from 'lucide-react'
import { CoinSide } from '../../types/coinflip'
import { useCoinFlipStore } from '../../store/coinflipStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { QuickBetGrid } from '../ui/QuickBetGrid'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface CoinFlipControlsProps {
  onStart: () => void
  onFlip: (guess: CoinSide) => void
  onCashout: () => void
}

export const CoinFlipControls: React.FC<CoinFlipControlsProps> = ({
  onStart,
  onFlip,
  onCashout,
}) => {
  const { bet, status, streak, multiplier, potentialPayout, isFlipping, setBet } =
    useCoinFlipStore()

  const { user } = useAuthStore()
  const { playClick } = useAudio()

  const isActive = status === 'ACTIVE'
  const canStart = user.balance >= bet

  const handleBetChange = (amount: number) => {
    playClick()
    setBet(amount)
  }

  return (
    <div className="bg-surface-2/90 border border-border-default rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-text-primary backdrop-blur-md">
      {/* Bet Section (Editable only when not in active round) */}
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
          step="1"
          min="1"
          max={user.balance}
          disabled={isActive || isFlipping}
          value={bet}
          onChange={(e) => setBet(parseFloat(e.target.value) || 1)}
          leftIcon={<Coins className="w-4 h-4 text-accent-gold" />}
          suffix="MC"
        />

        {/* Quick Bet Buttons */}
        <QuickBetGrid
          currentBet={bet}
          balance={user.balance}
          onBetChange={handleBetChange}
          presets={[5, 10, 25, 50, 100, 250]}
          disabled={isActive || isFlipping}
        />
      </div>

      {/* Round Live Stats if Active */}
      {isActive ? (
        <div className="p-3.5 bg-surface-3 border border-border-default rounded-2xl flex items-center justify-between shadow-inner">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary font-medium">POTENTIAL WIN</span>
            <div className="flex items-center gap-2 mt-0.5">
              <CurrencyDisplay amount={potentialPayout} size="md" className="text-primary" />
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary font-bold rounded-full font-mono">
                {multiplier.toFixed(2)}×
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-text-secondary font-medium">CURRENT STREAK</span>
            <span className="text-base font-extrabold text-white block font-mono">
              {streak} {streak === 1 ? 'Win' : 'Wins'}
            </span>
          </div>
        </div>
      ) : null}

      {/* Action Buttons: Pick Heads / Tails or Start Round */}
      {isActive ? (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Pick HEADS: Warm Gold / Crown */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isFlipping}
              onClick={() => {
                playClick()
                onFlip('HEADS')
              }}
              className="py-4 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-amber-950 font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-500/20 border-2 border-yellow-200 flex items-center justify-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="text-2xl select-none">👑</span>
              <span>HEADS</span>
            </motion.button>

            {/* Pick TAILS: Cool Silver / Coin */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isFlipping}
              onClick={() => {
                playClick()
                onFlip('TAILS')
              }}
              className="py-4 bg-gradient-to-tr from-slate-400 via-zinc-200 to-slate-300 text-zinc-900 font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-zinc-400/20 border-2 border-white flex items-center justify-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="text-2xl select-none">🪙</span>
              <span>TAILS</span>
            </motion.button>
          </div>

          {/* Cashout Button */}
          {streak > 0 && (
            <Button
              variant="gold"
              size="xl"
              fullWidth
              disabled={isFlipping}
              onClick={() => {
                playClick()
                onCashout()
              }}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              <span>CASHOUT {potentialPayout.toFixed(2)} MC ({multiplier.toFixed(2)}×)</span>
            </Button>
          )}
        </div>
      ) : (
        /* Start Game Button */
        <Button
          variant="primary"
          size="xl"
          fullWidth
          disabled={!canStart}
          onClick={() => {
            playClick()
            onStart()
          }}
          rightIcon={canStart ? <ArrowRight className="w-4 h-4" /> : undefined}
        >
          <span>{canStart ? `BET ${bet.toFixed(2)} MC & FLIP` : 'INSUFFICIENT BALANCE'}</span>
        </Button>
      )}
    </div>
  )
}

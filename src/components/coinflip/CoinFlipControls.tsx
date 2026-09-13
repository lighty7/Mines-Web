import React from 'react'
import { motion } from 'framer-motion'
import { Coins, CheckCircle, ArrowRight } from 'lucide-react'
import { CoinSide } from '../../types/coinflip'
import { useCoinFlipStore } from '../../store/coinflipStore'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'

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

  const quickBets = [5, 10, 25, 50, 100, 250]
  const isActive = status === 'ACTIVE'
  const canStart = user.balance >= bet

  const handleBetChange = (amount: number) => {
    playClick()
    setBet(amount)
  }

  return (
    <div className="bg-panel border border-tile-border rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-text-primary">
      {/* Bet Section (Editable only when not in active round) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
          <span>Bet Amount</span>
          <span>Balance: {user.balance.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
            <input
              type="number"
              step="1"
              min="1"
              max={user.balance}
              disabled={isActive || isFlipping}
              value={bet}
              onChange={(e) => setBet(parseFloat(e.target.value) || 1)}
              className="w-full pl-9 pr-3 py-2.5 bg-tile/70 border border-tile-border rounded-xl text-sm font-bold text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleBetChange(bet / 2)}
              disabled={isActive || isFlipping}
              className="px-2.5 py-2.5 bg-tile border border-tile-border hover:border-text-secondary/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              ½
            </button>
            <button
              onClick={() => handleBetChange(bet * 2)}
              disabled={isActive || isFlipping}
              className="px-2.5 py-2.5 bg-tile border border-tile-border hover:border-text-secondary/50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              2×
            </button>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-6 gap-1 mt-1">
          {quickBets.map((b) => (
            <button
              key={b}
              disabled={isActive || isFlipping}
              onClick={() => handleBetChange(b)}
              className={`py-1 rounded-lg text-[11px] font-bold transition-all ${
                bet === b
                  ? 'bg-primary text-black font-extrabold'
                  : 'bg-tile/40 hover:bg-tile border border-tile-border/50 text-text-secondary'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Round Live Stats if Active */}
      {isActive ? (
        <div className="p-3 bg-tile/40 border border-tile-border/50 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary font-medium">POTENTIAL WIN</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base font-extrabold text-primary font-mono">
                {potentialPayout.toFixed(2)}
              </span>
              <span className="text-xs px-2 py-0.2 bg-primary/20 text-primary font-bold rounded">
                {multiplier.toFixed(2)}×
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-text-secondary font-medium">STREAK</span>
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
            {/* Pick HEADS */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isFlipping}
              onClick={() => {
                playClick()
                onFlip('HEADS')
              }}
              className="py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <span className="text-2xl">👑</span>
              <span>HEADS</span>
            </motion.button>

            {/* Pick TAILS */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isFlipping}
              onClick={() => {
                playClick()
                onFlip('TAILS')
              }}
              className="py-4 bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <span className="text-2xl">🪙</span>
              <span>TAILS</span>
            </motion.button>
          </div>

          {/* Cashout Button */}
          {streak > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isFlipping}
              onClick={() => {
                playClick()
                onCashout()
              }}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-black font-extrabold text-sm rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>CASHOUT {potentialPayout.toFixed(2)} ({multiplier.toFixed(2)}×)</span>
            </motion.button>
          )}
        </div>
      ) : (
        /* Start Game Button */
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!canStart}
          onClick={() => {
            playClick()
            onStart()
          }}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
            canStart
              ? 'bg-primary hover:bg-primary-hover text-black shadow-primary/30'
              : 'bg-tile text-text-secondary border border-tile-border opacity-50 cursor-not-allowed'
          }`}
        >
          <span>{canStart ? `BET ${bet.toFixed(2)} & START` : 'INSUFFICIENT BALANCE'}</span>
          {canStart && <ArrowRight className="w-4 h-4" />}
        </motion.button>
      )}
    </div>
  )
}

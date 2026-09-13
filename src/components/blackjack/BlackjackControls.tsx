import React from 'react'
import { motion } from 'framer-motion'
import { Layers, ArrowUpCircle, Hand, Sparkles, Coins } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { QuickBetGrid } from '../ui/QuickBetGrid'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface BlackjackControlsProps {
  bet: number
  balance: number
  status: 'IDLE' | 'ACTIVE' | 'WON' | 'LOST' | 'PUSH'
  playerCardsCount: number
  isDealing: boolean
  onBetChange: (amount: number) => void
  onDeal: () => void
  onHit: () => void
  onStand: () => void
  onDouble: () => void
}

export const BlackjackControls: React.FC<BlackjackControlsProps> = ({
  bet,
  balance,
  status,
  playerCardsCount,
  isDealing,
  onBetChange,
  onDeal,
  onHit,
  onStand,
  onDouble,
}) => {
  const isPlaying = status === 'ACTIVE'
  const canDouble = isPlaying && playerCardsCount === 2 && balance >= bet

  return (
    <div className="w-full bg-surface-2/90 border border-border-default rounded-3xl p-5 shadow-xl flex flex-col gap-4 backdrop-blur-md">
      {/* Active In-Game Actions */}
      {isPlaying ? (
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-surface-3 border border-border-default rounded-2xl flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">ACTIVE STAKE</span>
            <CurrencyDisplay amount={bet} size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* HIT */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onHit}
              disabled={isDealing}
              className="h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>HIT</span>
            </motion.button>

            {/* STAND */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStand}
              disabled={isDealing}
              className="h-14 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 hover:brightness-110 active:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Hand className="w-4 h-4" />
              <span>STAND</span>
            </motion.button>

            {/* DOUBLE DOWN */}
            <motion.button
              type="button"
              whileHover={{ scale: canDouble ? 1.02 : 1 }}
              whileTap={{ scale: canDouble ? 0.98 : 1 }}
              onClick={onDouble}
              disabled={!canDouble || isDealing}
              className="h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:brightness-110 active:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>DOUBLE</span>
            </motion.button>
          </div>
        </div>
      ) : (
        /* Betting & Deal Layout */
        <div className="flex flex-col gap-4">
          {/* Bet Input */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="Bet Amount"
              labelRight={
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <span>Balance:</span>
                  <CurrencyDisplay amount={balance} size="xs" />
                </div>
              }
              type="number"
              min={1}
              max={balance}
              value={bet}
              onChange={(e) => onBetChange(Number(e.target.value) || 1)}
              disabled={isDealing}
              leftIcon={<Coins className="w-4 h-4 text-accent-gold" />}
              suffix="MC"
            />

            {/* Chip Presets with QuickBetGrid */}
            <QuickBetGrid
              currentBet={bet}
              balance={balance}
              onBetChange={onBetChange}
              presets={[1, 5, 25, 100, 500]}
              disabled={isDealing}
            />
          </div>

          {/* Deal Button */}
          <Button
            variant="primary"
            size="xl"
            fullWidth
            disabled={isDealing || balance < bet}
            onClick={onDeal}
            isLoading={isDealing}
            leftIcon={<Sparkles className="w-5 h-5 fill-current" />}
          >
            {isDealing ? (
              <span>DEALING CARDS...</span>
            ) : balance < bet ? (
              <span>INSUFFICIENT BALANCE</span>
            ) : (
              <span>DEAL HAND ({bet} MC)</span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

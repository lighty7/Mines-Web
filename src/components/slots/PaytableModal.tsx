import React from 'react'
import { Sparkles, Layers } from 'lucide-react'
import { SYMBOLS, PAYLINES } from '../../engine/slotsEngine'
import { Modal } from '../ui/Modal'

interface PaytableModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Neon Rush Paytable"
      subtitle="96.5% RTP · 20 Fixed Paylines · 5 Reels"
      size="lg"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Special Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Wild Feature */}
          <div className="p-4 bg-accent-gold/10 border border-accent-gold/30 rounded-2xl flex items-start gap-3">
            <span className="text-3xl select-none">⚡</span>
            <div>
              <h4 className="text-xs font-black text-accent-gold uppercase tracking-wider">
                WILD SYMBOL
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Substitutes for any standard symbol to complete highest paying combinations on active paylines.
              </p>
              <p className="text-[11px] font-mono text-accent-gold font-bold mt-1.5">
                5 Wilds = 750× Line Bet!
              </p>
            </div>
          </div>

          {/* Scatter Feature */}
          <div className="p-4 bg-game-slots/10 border border-game-slots/30 rounded-2xl flex items-start gap-3">
            <span className="text-3xl select-none">⭐</span>
            <div>
              <h4 className="text-xs font-black text-game-slots uppercase tracking-wider">
                SCATTER & FREE SPINS
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Land 3 or more anywhere on the reels to trigger Free Spins with automatic multiplier boost:
              </p>
              <div className="text-[11px] font-mono text-game-slots font-bold mt-1.5 flex flex-col gap-0.5">
                <span>• 3 Stars = 10 Free Spins + 2×</span>
                <span>• 4 Stars = 15 Free Spins + 10×</span>
                <span>• 5 Stars = 25 Free Spins + 50×</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Symbols Grid */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Standard Symbol Multipliers (× Line Bet)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.values(SYMBOLS).map((sym) => (
              <div
                key={sym.id}
                className="p-3 bg-surface-3 border border-border-default rounded-xl flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all"
              >
                <span className="text-3xl select-none">{sym.char}</span>
                <span className="text-xs font-extrabold text-text-primary uppercase">{sym.name}</span>
                <div className="w-full text-[11px] font-mono text-text-secondary flex flex-col gap-0.5 mt-1 pt-1 border-t border-border-subtle">
                  <div className="flex justify-between">
                    <span>5 Match:</span>
                    <span className="text-primary font-bold">{sym.payouts[5]}×</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4 Match:</span>
                    <span className="text-text-primary font-bold">{sym.payouts[4]}×</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3 Match:</span>
                    <span className="text-text-muted">{sym.payouts[3]}×</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paylines Explanation */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>20 Winning Paylines</span>
          </h4>
          <p className="text-xs text-text-muted">
            Winning combinations pay left-to-right starting from reel 1 on enabled lines.
          </p>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 mt-1">
            {PAYLINES.map((_, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-surface-3/60 border border-border-default rounded-lg flex items-center justify-center text-center"
              >
                <span className="text-xs font-mono font-bold text-primary">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

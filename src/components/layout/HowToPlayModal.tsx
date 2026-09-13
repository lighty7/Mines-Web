import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface HowToPlayModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Casino Game Rules & Guidelines"
      subtitle="Complete rules, provable fairness, and guidelines across all 5 games"
      size="lg"
    >
      <div className="flex flex-col gap-3 py-2 text-xs text-text-secondary">
        <div className="p-3.5 bg-surface-3/80 border border-border-default rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <span className="text-base select-none">💣</span>
            <span>1. Mines (99.0% RTP)</span>
          </div>
          <p className="leading-relaxed">
            Configure your grid size (4x4, 5x5, 6x6) and mines count (1 to MAX). Each safe diamond revealed compounds your multiplier. Cash out at any time or press Space to bank your winnings!
          </p>
        </div>

        <div className="p-3.5 bg-surface-3/80 border border-border-default rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <span className="text-base select-none">🎰</span>
            <span>2. Neon Rush Slots (96.5% RTP)</span>
          </div>
          <p className="leading-relaxed">
            5-reel, 20-payline video slot. Wild symbols (⚡) substitute for any standard symbol with up to 750× line win. 3 or more Stars (⭐) trigger 10–25 Free Spins with automatic multiplier boost.
          </p>
        </div>

        <div className="p-3.5 bg-surface-3/80 border border-border-default rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <span className="text-base select-none">🎡</span>
            <span>3. European Roulette (97.3% RTP)</span>
          </div>
          <p className="leading-relaxed">
            Single-zero 37-pocket wheel (0 to 36). Place Straight bets (35:1), Columns/Dozens (2:1), or outside 1:1 bets (Red/Black, Odd/Even, 1-18/19-36). The wheel uses realistic landing physics.
          </p>
        </div>

        <div className="p-3.5 bg-surface-3/80 border border-border-default rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <span className="text-base select-none">🃏</span>
            <span>4. Blackjack 21 (99.5% RTP)</span>
          </div>
          <p className="leading-relaxed">
            Classic player vs dealer 21 from a 6-deck shoe. Natural Blackjack pays 3:2. Dealer stands on 17. Use Hit, Stand, or Double Down on initial two-card hands.
          </p>
        </div>

        <div className="p-3.5 bg-surface-3/80 border border-border-default rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <span className="text-base select-none">🪙</span>
            <span>5. Coin Flip Streak Ladder (98.0% RTP)</span>
          </div>
          <p className="leading-relaxed">
            Guess Heads or Tails to climb the compounding streak ladder. Consecutive correct flips multiply your payout up to 8 levels. Cash out at any stage of the streak!
          </p>
        </div>

        <div className="p-3.5 bg-surface-3/80 border border-border-default rounded-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-text-primary font-bold">
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            <span>Cryptographic Provable Fairness</span>
          </div>
          <p className="leading-relaxed">
            Every round generates a SHA-256 hash commitment before play begins, guaranteeing the outcome is predetermined, unmanipulated, and mathematically verifiable.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onClose}
          className="mt-2"
        >
          Got It, Let's Play!
        </Button>
      </div>
    </Modal>
  )
}

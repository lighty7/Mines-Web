import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export const BlackjackView: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[460px] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl p-8 bg-panel border border-tile-border rounded-3xl shadow-2xl flex flex-col items-center gap-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(85,214,255,0.2)]">
          🃏
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>99.5% RTP · VEGAS STRIP RULES</span>
          </div>
          <h2 className="text-2xl font-black text-white">Blackjack 21</h2>
          <p className="text-sm text-text-secondary mt-2">
            Player vs Dealer card battle featuring 6-deck shoe, natural 3:2 payouts, Hit, Stand, Double Down, and Split strategies with realistic card sliding sound effects.
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-3 text-left">
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">Natural BJ</span>
            <span className="text-base font-extrabold text-cyan-400 font-mono">3:2 Payout</span>
          </div>
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">Dealer Rules</span>
            <span className="text-base font-extrabold text-white font-mono">Stands on 17</span>
          </div>
          <div className="p-3 bg-tile/40 border border-tile-border/40 rounded-2xl">
            <span className="text-xs text-text-secondary block">Options</span>
            <span className="text-base font-extrabold text-primary font-mono">Double & Split</span>
          </div>
        </div>

        <div className="p-3 bg-tile/20 border border-tile-border/40 rounded-xl text-xs text-text-secondary">
          Database schema & Aiven PostgreSQL integration prepared. Ready for Next Step activation!
        </div>
      </motion.div>
    </div>
  )
}

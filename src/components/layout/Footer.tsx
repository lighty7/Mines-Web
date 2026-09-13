import React from 'react'
import { HelpCircle, Shield } from 'lucide-react'

interface FooterProps {
  onOpenHowToPlay: () => void
  onOpenAdmin?: () => void
}

export const Footer: React.FC<FooterProps> = ({ onOpenHowToPlay, onOpenAdmin }) => {
  return (
    <footer className="w-full border-t border-border-subtle py-5 px-4 lg:px-8 mt-12 text-xs text-text-muted">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info links */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>How to Play</span>
          </button>

          <span className="text-border-default">•</span>

          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent-gold" />
            <span>99.0% RTP Fair Gaming</span>
          </div>

          {onOpenAdmin && (
            <>
              <span className="text-border-default">•</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 hover:text-danger transition-colors cursor-pointer"
                title="Admin Command Gateway (Ctrl+Shift+A)"
              >
                <Shield className="w-3.5 h-3.5 text-danger/70" />
                <span>Admin</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Disclaimer */}
        <div className="text-[11px] text-text-disabled">
          Mines Casino Suite · Provably Fair Cryptographic Entertainment
        </div>
      </div>
    </footer>
  )
}

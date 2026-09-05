import React from 'react'
import { HelpCircle, Shield, Globe } from 'lucide-react'

interface FooterProps {
  onOpenHowToPlay: () => void
}

export const Footer: React.FC<FooterProps> = ({ onOpenHowToPlay }) => {
  return (
    <footer className="w-full border-t border-tile-border/40 py-6 px-4 lg:px-8 mt-12 bg-panel/30 text-xs text-text-secondary">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 hover:text-text-primary transition-colors text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>How to Play</span>
          </button>

          <span className="text-tile-border">•</span>

          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent-gold" />
            <span>99.0% RTP Fair Game</span>
          </div>

          <span className="text-tile-border hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Live Render Server</span>
          </div>
        </div>

        {/* Right copyright */}
        <div className="text-[11px] text-text-muted text-center sm:text-right">
          © {new Date().getFullYear()} Mines Game • Cross-Platform Web & Android
        </div>
      </div>
    </footer>
  )
}

import React, { useState } from 'react'
import { Shield, Keyboard, Copy, Check } from 'lucide-react'

export interface GameFooterProps {
  serverSeedHash?: string | null
  serverSeed?: string | null
  hotkeyHint?: string
  className?: string
}

export const GameFooter: React.FC<GameFooterProps> = ({
  serverSeedHash,
  serverSeed,
  hotkeyHint,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const hashToShow = serverSeedHash || serverSeed

  const handleCopy = () => {
    if (!hashToShow) return
    navigator.clipboard.writeText(hashToShow)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-surface-2/60 border border-border-default/70 rounded-xl text-xs text-text-secondary ${className}`}
    >
      {/* Left: Provably Fair Commit Hash */}
      {hashToShow ? (
        <div className="flex items-center gap-2 max-w-full truncate font-mono text-[11px]">
          <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="font-bold text-text-primary">Seed:</span>
          <span className="truncate text-text-muted" title={hashToShow}>
            {hashToShow}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            title="Copy seed hash"
            className="p-1 rounded hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
          >
            {copied ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[11px]">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Provably Fair Cryptographic Randomness</span>
        </div>
      )}

      {/* Right: Keyboard Shortcut Hint */}
      {hotkeyHint && (
        <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
          <Keyboard className="w-3.5 h-3.5 text-primary" />
          <span>Hotkey:</span>
          <kbd className="px-1.5 py-0.5 bg-surface-3 border border-border-default rounded font-mono font-bold text-text-primary text-[10px] shadow-sm">
            Space
          </kbd>
          <span className="text-text-muted">{hotkeyHint}</span>
        </div>
      )}
    </div>
  )
}

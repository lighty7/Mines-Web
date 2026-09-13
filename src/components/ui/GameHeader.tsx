import React from 'react'
import { Shield } from 'lucide-react'
import { Badge } from './Badge'

export interface GameHeaderProps {
  icon: string | React.ReactNode
  title: string
  subtitle?: string
  rtp?: string
  isGuest?: boolean
  rightElement?: React.ReactNode
  accentColor?: string
  className?: string
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  icon,
  title,
  subtitle,
  rtp = '99.0% RTP',
  isGuest = false,
  rightElement,
  accentColor,
  className = '',
}) => {
  return (
    <div
      className={`w-full flex flex-wrap items-center justify-between gap-3 bg-surface-2/80 backdrop-blur-md border border-border-default px-4 sm:px-5 py-3 rounded-2xl shadow-md ${className}`}
    >
      {/* Left: Icon, Game Title, Subtitle & RTP Badge */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-surface-3 border border-border-default flex items-center justify-center text-xl shadow-inner flex-shrink-0"
          style={accentColor ? { borderColor: `${accentColor}40` } : undefined}
        >
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-text-primary tracking-wide leading-tight">
              {title}
            </h2>
            {rtp && (
              <Badge variant="primary" size="sm">
                {rtp}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Guest Mode / Provably Fair & Custom elements */}
      <div className="flex items-center gap-2.5">
        {isGuest ? (
          <Badge variant="warning" size="sm" dot>
            Guest Demo
          </Badge>
        ) : (
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            <span>Fair</span>
          </div>
        )}

        {rightElement}
      </div>
    </div>
  )
}

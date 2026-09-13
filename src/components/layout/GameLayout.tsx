import React from 'react'
import { GameHeader } from '../ui/GameHeader'
import { GameFooter } from './GameFooter'

export interface GameLayoutProps {
  icon: string | React.ReactNode
  title: string
  subtitle: string
  rtp?: string
  isGuest?: boolean
  serverSeedHash?: string | null
  serverSeed?: string | null
  hotkeyHint?: string
  accentColor?: string
  headerRight?: React.ReactNode
  controls: React.ReactNode
  playArea: React.ReactNode
  className?: string
}

/**
 * Standardized 2-Panel Casino Game Layout
 * Desktop (lg+): Controls on Left (col 1-4), Play Area on Right (col 5-12)
 * Mobile (<lg): Play Area on Top (col-span-full), Controls Below
 */
export const GameLayout: React.FC<GameLayoutProps> = ({
  icon,
  title,
  subtitle,
  rtp,
  isGuest,
  serverSeedHash,
  serverSeed,
  hotkeyHint,
  accentColor,
  headerRight,
  controls,
  playArea,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-5 ${className}`}>
      {/* 1. Standardized Game Header Banner */}
      <GameHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        rtp={rtp}
        isGuest={isGuest}
        accentColor={accentColor}
        rightElement={headerRight}
      />

      {/* 2. Responsive 2-Panel Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls: Desktop left column (col 1-4), Mobile bottom */}
        <div className="order-2 lg:order-1 lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {controls}
        </div>

        {/* Play Area: Desktop right column (col 5-12), Mobile top */}
        <div className="order-1 lg:order-2 lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center min-h-[460px]">
          {playArea}
        </div>
      </div>

      {/* 3. Provably Fair Verification & Hotkey Footer */}
      {(serverSeedHash || serverSeed || hotkeyHint) && (
        <GameFooter
          serverSeedHash={serverSeedHash}
          serverSeed={serverSeed}
          hotkeyHint={hotkeyHint}
        />
      )}
    </div>
  )
}

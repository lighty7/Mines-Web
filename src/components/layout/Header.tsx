import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Coins, RefreshCw, LogIn, UserPlus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'
import { CasinoGame } from '../../types'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'
import { Button } from '../ui/Button'

export const CASINO_GAMES: Array<{
  id: CasinoGame
  name: string
  icon: string
  accentColor: string
}> = [
  { id: 'mines', name: 'Mines', icon: '💣', accentColor: '#18C964' },
  { id: 'slots', name: 'Slots', icon: '🎰', accentColor: '#F59E0B' },
  { id: 'roulette', name: 'Roulette', icon: '🎡', accentColor: '#EF4444' },
  { id: 'blackjack', name: 'Blackjack', icon: '🃏', accentColor: '#22D3EE' },
  { id: 'coinflip', name: 'Coin Flip', icon: '🪙', accentColor: '#F5C451' },
]

interface HeaderProps {
  activeGame: CasinoGame
  onSelectGame: (game: CasinoGame) => void
  onOpenAuth: (tab: 'signin' | 'register') => void
  onOpenProfile: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeGame,
  onSelectGame,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, refreshProfile, serverOnline } = useAuthStore()
  const { muted, toggleMute, playClick } = useAudio()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    playClick()
    setIsRefreshing(true)
    await refreshProfile()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <header className="w-full bg-surface-1/90 backdrop-blur-lg border-b border-border-default sticky top-0 z-30 transition-all">
      {/* 1. Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Branding & System Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0 select-none text-lg sm:text-xl">
            💎
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-wider bg-gradient-to-r from-text-primary via-emerald-200 to-primary bg-clip-text text-transparent leading-none">
                MINES CASINO
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  serverOnline === true
                    ? 'bg-primary animate-pulse'
                    : serverOnline === false
                    ? 'bg-danger'
                    : 'bg-warning'
                }`}
              />
              <span className="hidden sm:inline text-[11px] font-medium">
                {serverOnline === true
                  ? 'Provably Fair Suite'
                  : serverOnline === false
                  ? 'Offline Simulation Mode'
                  : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Balance, Sound, Profile & Auth CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet Balance Display */}
          <div className="flex items-center bg-surface-2 border border-border-default rounded-xl px-2.5 sm:px-3.5 py-1.5 gap-2 shadow-inner">
            <Coins className="w-4 h-4 text-accent-gold flex-shrink-0" />
            <div className="flex flex-col text-right">
              <span className="hidden sm:block text-[10px] text-text-muted font-bold uppercase tracking-wider leading-none">
                Balance
              </span>
              <CurrencyDisplay
                amount={user.balance}
                size="sm"
                className="text-primary leading-tight"
              />
            </div>
            {!user.isGuest && (
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh balance"
                className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-surface-3 transition-colors ml-0.5"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                />
              </button>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              playClick()
              toggleMute()
            }}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-9 h-9 rounded-xl bg-surface-2 border border-border-default hover:border-border-strong flex items-center justify-center text-text-secondary hover:text-text-primary transition-all flex-shrink-0 cursor-pointer"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-danger" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* User Profile or Guest Auth */}
          {user.isGuest ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogIn className="w-3.5 h-3.5" />}
                onClick={() => {
                  playClick()
                  onOpenAuth('signin')
                }}
              >
                <span className="hidden sm:inline">Sign In</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => {
                  playClick()
                  onOpenAuth('register')
                }}
              >
                <span className="hidden sm:inline">Register</span>
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                playClick()
                onOpenProfile()
              }}
              className="flex items-center gap-2 bg-surface-2 hover:bg-surface-3 border border-border-default hover:border-primary/40 rounded-xl px-2.5 py-1.5 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-black font-extrabold text-xs flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-text-primary leading-tight">
                  {user.username}
                </span>
                <span className="text-[10px] text-primary font-medium leading-none">
                  Verified
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Header: Casino Game Navigation Bar */}
      <div className="w-full border-t border-border-subtle bg-surface-2/40 px-2 sm:px-4">
        <nav
          aria-label="Casino Games"
          className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-1.5"
        >
          {CASINO_GAMES.map((game) => {
            const isActive = activeGame === game.id

            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  playClick()
                  onSelectGame(game.id)
                }}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-3/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGameNavPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-surface-3 border border-border-strong rounded-xl shadow-sm -z-10"
                    style={{ borderBottomColor: game.accentColor, borderBottomWidth: '2px' }}
                  />
                )}

                <span className="text-sm select-none">{game.icon}</span>
                <span>{game.name}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

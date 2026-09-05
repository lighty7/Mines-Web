import React from 'react'
import { Volume2, VolumeX, User, Coins, RefreshCw, LogIn, UserPlus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAudio } from '../../hooks/useAudio'

interface HeaderProps {
  onOpenAuth: (tab: 'signin' | 'register') => void
  onOpenProfile: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onOpenProfile }) => {
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
    <header className="w-full bg-panel/80 backdrop-blur-md border-b border-tile-border/60 sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-xl select-none">💣</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-text-primary via-emerald-200 to-primary bg-clip-text text-transparent">
                MINES
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-primary/15 text-primary border border-primary/30">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline === true
                    ? 'bg-primary animate-pulse'
                    : serverOnline === false
                    ? 'bg-accent-red'
                    : 'bg-yellow-400'
                }`}
              />
              <span className="hidden sm:inline">
                {serverOnline === true ? 'Server Online' : serverOnline === false ? 'Offline Mode' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet Balance Display */}
          <div className="flex items-center bg-tile border border-tile-border rounded-xl px-3 py-1.5 gap-2 shadow-inner">
            <Coins className="w-4 h-4 text-accent-gold" />
            <div className="flex flex-col text-right">
              <span className="text-xs text-text-secondary font-medium leading-none">Balance</span>
              <span className="text-sm sm:text-base font-bold font-mono text-primary leading-tight">
                {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-[10px] text-text-secondary font-sans font-normal">mineCoin</span>
              </span>
            </div>
            {!user.isGuest && (
              <button
                onClick={handleRefresh}
                title="Refresh balance"
                className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-tile-hover ml-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
              </button>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              playClick()
              toggleMute()
            }}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-10 h-10 rounded-xl bg-tile border border-tile-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-tile-hover transition-all"
          >
            {muted ? <VolumeX className="w-4 h-4 text-accent-red" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>

          {/* User Profile or Login/Register */}
          {user.isGuest ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playClick()
                  onOpenAuth('signin')
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-tile hover:bg-tile-hover border border-tile-border text-text-primary transition-all"
              >
                <LogIn className="w-4 h-4 text-text-secondary" />
                <span className="hidden sm:inline">Sign In</span>
              </button>

              <button
                onClick={() => {
                  playClick()
                  onOpenAuth('register')
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Register</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playClick()
                onOpenProfile()
              }}
              className="flex items-center gap-2.5 bg-tile hover:bg-tile-hover border border-tile-border hover:border-primary/40 rounded-xl px-3 py-1.5 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-text-primary leading-tight">{user.username}</span>
                <span className="text-[10px] text-primary leading-none">Verified</span>
              </div>
              <User className="w-3.5 h-3.5 text-text-secondary md:hidden" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

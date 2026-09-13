import React, { useEffect, useState, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { AuthModal } from './components/auth/AuthModal'
import { ProfileModal } from './components/profile/ProfileModal'
import { HowToPlayModal } from './components/layout/HowToPlayModal'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { AdminLoginModal } from './components/admin/AdminLoginModal'
import { useAuthStore } from './store/authStore'
import { useGameStore } from './store/gameStore'
import { useAdminStore } from './store/adminStore'
import { useAudio } from './hooks/useAudio'
import confetti from 'canvas-confetti'
import { MinesView } from './components/mines/MinesView'
import { SlotsView } from './components/slots/SlotsView'
import { RouletteView } from './components/roulette/RouletteView'
import { BlackjackView } from './components/blackjack/BlackjackView'
import { CoinFlipView } from './components/coinflip/CoinFlipView'
import { CasinoGame } from './types'
import { ToastProvider } from './components/ui/Toast'
import { Alert } from './components/ui/Alert'

export const App: React.FC = () => {
  const { checkServer, refreshProfile, serverOnline } = useAuthStore()
  const { gameState, revealedCount, startGame, cashout, isLoading } = useGameStore()
  const { adminToken } = useAdminStore()
  const { playClick, playCashout } = useAudio()

  // Modal visibility states
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'register'>('signin')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false)

  // Active Casino Game (Mines, Slots, Roulette, Blackjack, Coin Flip)
  const [activeGame, setActiveGame] = useState<CasinoGame>(() => {
    const hash = window.location.hash.replace('#', '').toLowerCase()
    if (['mines', 'slots', 'roulette', 'blackjack', 'coinflip'].includes(hash)) {
      return hash as CasinoGame
    }
    return 'mines'
  })

  const handleSelectGame = useCallback((game: CasinoGame) => {
    setActiveGame(game)
    if (window.location.hash !== `#${game}`) {
      window.location.hash = game
    }
  }, [])

  // Admin View State (triggered by #admin hash, footer button, or Ctrl+Shift+A)
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')
  })
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false)

  // Server health polling and user profile refresh on mount
  useEffect(() => {
    checkServer()
    refreshProfile()

    const interval = setInterval(() => {
      checkServer()
    }, 45000)

    return () => clearInterval(interval)
  }, [checkServer, refreshProfile])

  // Open auth modal helper
  const handleOpenAuth = useCallback((tab: 'signin' | 'register') => {
    setAuthInitialTab(tab)
    setAuthModalOpen(true)
  }, [])

  // Admin Open Handler
  const handleOpenAdmin = useCallback(() => {
    if (adminToken) {
      setIsAdminView(true)
    } else {
      setAdminLoginModalOpen(true)
    }
  }, [adminToken])

  // Keyboard shortcut listener for Spacebar, Escape, and Ctrl+Shift+A (Admin)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Admin Hotkey: Ctrl + Shift + A
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault()
        handleOpenAdmin()
        return
      }

      // If modal open, Escape closes modals
      if (e.key === 'Escape') {
        if (authModalOpen || profileModalOpen || howToPlayModalOpen || adminLoginModalOpen) {
          setAuthModalOpen(false)
          setProfileModalOpen(false)
          setHowToPlayModalOpen(false)
          setAdminLoginModalOpen(false)
          return
        }
      }

      // Ignore when user is actively typing in form inputs or on admin dashboard
      if (isAdminView) return
      const target = e.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return
      }

      // Spacebar hotkey (for Mines game only; other games handle their own Space key)
      if (e.code === 'Space') {
        if (activeGame !== 'mines') return
        e.preventDefault()
        if (isLoading || authModalOpen || profileModalOpen || howToPlayModalOpen || adminLoginModalOpen) return

        if (gameState === 'ACTIVE') {
          if (revealedCount > 0) {
            playClick()
            const result = await cashout()
            if (result) {
              playCashout()
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              })
            }
          }
        } else {
          playClick()
          await startGame()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeGame,
    gameState,
    revealedCount,
    isLoading,
    authModalOpen,
    profileModalOpen,
    howToPlayModalOpen,
    adminLoginModalOpen,
    isAdminView,
    cashout,
    startGame,
    playClick,
    playCashout,
    handleOpenAdmin,
  ])

  // If Admin View is active and authenticated, display Admin Dashboard
  if (isAdminView && adminToken) {
    return (
      <AdminDashboard
        onExit={() => {
          setIsAdminView(false)
          if (window.location.hash === '#admin') {
            window.location.hash = ''
          }
        }}
      />
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/30 selection:text-primary">
      {/* Top Header */}
      <Header
        activeGame={activeGame}
        onSelectGame={handleSelectGame}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col justify-between">
        {/* Render Cold-Start Banner (if server offline or checking) */}
        {serverOnline === false && (
          <div className="mb-6">
            <Alert variant="warning" title="Render Server Status">
              The backend spins down after inactivity. While it wakes up (approx. 30–50s), <span className="font-semibold text-text-primary">Guest Mode</span> is 100% active with full local simulation!
            </Alert>
          </div>
        )}

        {/* Selected Casino Game View */}
        {activeGame === 'mines' && <MinesView />}
        {activeGame === 'slots' && <SlotsView />}
        {activeGame === 'roulette' && <RouletteView />}
        {activeGame === 'blackjack' && <BlackjackView />}
        {activeGame === 'coinflip' && <CoinFlipView />}

        {/* Footer */}
        <Footer
          onOpenHowToPlay={() => setHowToPlayModalOpen(true)}
          onOpenAdmin={handleOpenAdmin}
        />
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <HowToPlayModal
        isOpen={howToPlayModalOpen}
        onClose={() => setHowToPlayModalOpen(false)}
      />

      {/* Admin Gateway Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={() => {
          setAdminLoginModalOpen(false)
          setIsAdminView(true)
        }}
      />
    </div>
    </ToastProvider>
  )
}

export default App

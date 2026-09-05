import React, { useEffect, useState, useCallback } from 'react'
import { Header } from './components/layout/Header'
import { Board } from './components/game/Board'
import { BettingControls } from './components/game/BettingControls'
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
import { Keyboard, AlertCircle } from 'lucide-react'

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

      // Spacebar hotkey
      if (e.code === 'Space') {
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
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-primary/30 selection:text-primary">
      {/* Top Header */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col justify-between">
        {/* Render Cold-Start Banner (if server offline or checking) */}
        {serverOnline === false && (
          <div className="mb-6 p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center gap-3 text-xs text-yellow-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-400" />
            <div className="flex-1">
              <span className="font-bold">Render Free Server Status:</span> The backend spins down after inactivity. While it wakes up (approx. 30–50s), <span className="font-semibold text-white">Guest Mode</span> is 100% active with full local simulation!
            </div>
          </div>
        )}

        {/* Game Layout: Responsive Left Betting Controls + Center/Right Mines Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Betting Controls (Col 1-5 on LG) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            <BettingControls />

            {/* Quick Keyboard Hotkey Pill */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-panel/50 border border-tile-border/50 rounded-xl text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5 text-primary" />
                <span>Hotkey:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-tile border border-tile-border rounded text-[10px] font-mono text-text-primary font-bold shadow-sm">
                  Space
                </kbd>
                <span className="text-[11px]">
                  {gameState === 'ACTIVE' ? 'Cashout' : 'Start Bet'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Board (Col 6-12 on LG) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center min-h-[460px]">
            <Board />
          </div>
        </div>

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
  )
}

export default App

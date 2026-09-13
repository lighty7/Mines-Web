import React, { useState, useEffect } from 'react'
import { User, Mail, Home, Coins, RefreshCw, LogOut, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { userApi } from '../../api/user.api'
import { UserTransaction } from '../../types'
import { getErrorMessage } from '../../api/client'
import { useAudio } from '../../hooks/useAudio'
import { Modal } from '../ui/Modal'
import { Tabs } from '../ui/Tabs'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuthStore()
  const { playClick } = useAudio()

  const [activeTab, setActiveTab] = useState<'details' | 'transactions'>('details')

  // Profile Edit State
  const [username, setUsername] = useState(user.username)
  const [address, setAddress] = useState(user.address || '')
  const [isSaving, setIsSaving] = useState(false)

  // Transactions State
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [isLoadingTx, setIsLoadingTx] = useState(false)

  // Feedback states
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setUsername(user.username)
    setAddress(user.address || '')
    setSuccessMsg(null)
    setErrorMsg(null)
  }, [user, isOpen])

  const fetchTransactions = async () => {
    if (user.isGuest) return
    setIsLoadingTx(true)
    setErrorMsg(null)
    try {
      const list = await userApi.getTransactions(50)
      setTransactions(list)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsLoadingTx(false)
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'transactions') {
      fetchTransactions()
    }
  }, [isOpen, activeTab])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    setIsSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await userApi.updateProfile({
        username: username.trim(),
        address: address.trim() || undefined,
      })
      updateProfile(username.trim(), address.trim())
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch (_) {
      return isoString.slice(0, 19).replace('T', ' ')
    }
  }

  const tabs = [
    { id: 'details', label: 'Account Details' },
    { id: 'transactions', label: `Transactions (${transactions.length})` },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Player Profile"
      subtitle="Manage your player account credentials and live wallet history"
      size="lg"
    >
      <div className="flex flex-col gap-4 py-2">
        {/* User Header */}
        <div className="flex items-center gap-3.5 p-3.5 bg-surface-3/60 border border-border-default rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-primary/20 flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-text-primary">{user.username}</h3>
              <Badge variant="primary" size="sm">
                Verified Player
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{user.email || 'Guest Session'}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <Tabs
          items={tabs}
          activeTab={activeTab}
          onChange={(val) => {
            playClick()
            setActiveTab(val as 'details' | 'transactions')
          }}
          size="md"
        />

        {/* Feedback Banners */}
        {errorMsg && (
          <Alert variant="error" onDismiss={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" onDismiss={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            {/* Balance Card */}
            <div className="p-4 rounded-2xl bg-surface-3 border border-border-default flex items-center justify-between">
              <div>
                <span className="text-xs text-text-secondary font-medium">Circulating Wallet Balance</span>
                <div className="mt-0.5">
                  <CurrencyDisplay amount={user.balance} size="lg" className="text-primary" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                <Coins className="w-5 h-5 text-accent-gold" />
              </div>
            </div>

            {/* Username Input */}
            <Input
              label="Username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24))}
              leftIcon={<User className="w-4 h-4" />}
            />

            {/* Email (Readonly) */}
            <Input
              label="Email Address"
              type="email"
              disabled
              value={user.email}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {/* Address */}
            <Input
              label="Residential Address"
              type="text"
              placeholder="City, Country (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<Home className="w-4 h-4" />}
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={() => {
                  playClick()
                  logout()
                  onClose()
                }}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Log Out
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSaving || username.length < 3}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          /* TAB 2: TRANSACTIONS */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-secondary">Recent Ledger Audit</span>
              <button
                type="button"
                disabled={isLoadingTx}
                onClick={fetchTransactions}
                className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingTx && transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-text-secondary gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Fetching ledger audit...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-surface-3 border border-border-default rounded-2xl">
                <span className="text-3xl mb-2 select-none">📜</span>
                <span className="text-sm font-semibold text-text-primary">No Transactions Yet</span>
                <p className="text-xs text-text-muted mt-1">
                  Play rounds across Mines, Slots, Roulette, Blackjack, or Coin Flip to view your verifiable ledger.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                {transactions.map((tx) => {
                  const isWin = tx.type.toUpperCase() === 'WIN'
                  const isBet = tx.type.toUpperCase() === 'BET'

                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-surface-3/80 border border-border-default rounded-xl flex items-center justify-between text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge
                          variant={isWin ? 'success' : isBet ? 'danger' : 'gold'}
                          size="sm"
                        >
                          {isWin ? 'WIN 🏆' : isBet ? 'BET 🎯' : tx.type}
                        </Badge>

                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">
                            {isWin ? 'Game Payout' : isBet ? 'Round Stake' : tx.type}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">{formatDateTime(tx.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <CurrencyDisplay
                          amount={isBet ? -tx.amount : tx.amount}
                          size="sm"
                          showSign
                          coloring
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

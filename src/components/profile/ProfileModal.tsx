import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Home, Coins, RefreshCw, LogOut, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { userApi } from '../../api/user.api'
import { UserTransaction } from '../../types'
import { getErrorMessage } from '../../api/client'
import { useAudio } from '../../hooks/useAudio'

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

  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-panel border border-tile-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-tile-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-primary/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary">{user.username}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/20 text-primary border border-primary/30">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-text-secondary">{user.email || 'Guest User'}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-tile rounded-xl border border-tile-border mb-5">
          <button
            type="button"
            onClick={() => {
              playClick()
              setActiveTab('details')
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'details'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            👤 Account Details
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setActiveTab('transactions')
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'transactions'
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            📋 Transactions ({transactions.length})
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-accent-red/15 border border-accent-red/40 text-accent-red text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-primary/15 border border-primary/40 text-primary text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            {/* Balance Card */}
            <div className="p-4 rounded-xl bg-tile border border-tile-border flex items-center justify-between">
              <div>
                <span className="text-xs text-text-secondary">Live Server Balance</span>
                <div className="text-xl font-mono font-extrabold text-primary">
                  {user.balance.toFixed(2)}{' '}
                  <span className="text-xs font-sans font-normal text-text-secondary">mineCoin</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                <Coins className="w-5 h-5 text-accent-gold" />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="text-xs font-semibold text-text-secondary">Username</label>
              <div className="relative flex items-center mt-1">
                <User className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24))}
                  className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="text-xs font-semibold text-text-secondary">Email Address</label>
              <div className="relative flex items-center mt-1">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-tile/50 border border-tile-border/50 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-secondary cursor-not-allowed"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-text-secondary">Residential Address</label>
              <div className="relative flex items-center mt-1">
                <Home className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Optional address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  playClick()
                  logout()
                  onClose()
                }}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold border border-accent-red/50 text-accent-red hover:bg-accent-red/10 flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>

              <button
                type="submit"
                disabled={isSaving || username.length < 3}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* TAB 2: TRANSACTIONS */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">Recent Round Transactions</span>
              <button
                type="button"
                disabled={isLoadingTx}
                onClick={fetchTransactions}
                className="flex items-center gap-1 text-xs text-accent-cyan hover:underline p-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingTx ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoadingTx && transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-text-secondary gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Loading history...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-tile border border-tile-border rounded-xl">
                <span className="text-3xl mb-2">📜</span>
                <span className="text-sm font-semibold text-text-primary">No Transactions Yet</span>
                <p className="text-xs text-text-secondary mt-1">
                  Place bets or cash out in the game to see your real-time transaction history here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const isWin = tx.type.toUpperCase() === 'WIN'
                  const isBet = tx.type.toUpperCase() === 'BET'

                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-tile border border-tile-border rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            isWin
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : isBet
                              ? 'bg-accent-red/20 text-accent-red border border-accent-red/30'
                              : 'bg-accent-gold/20 text-accent-gold'
                          }`}
                        >
                          {isWin ? 'WIN 🏆' : isBet ? 'BET 🎯' : tx.type}
                        </span>

                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">
                            {isWin ? 'Game Payout' : isBet ? 'Round Bet' : tx.type}
                          </span>
                          <span className="text-[10px] text-text-secondary">{formatDateTime(tx.createdAt)}</span>
                        </div>
                      </div>

                      <div className="font-mono font-bold text-sm text-right">
                        <span className={isWin ? 'text-primary' : isBet ? 'text-accent-red' : 'text-text-primary'}>
                          {isWin ? `+${tx.amount.toFixed(2)}` : isBet ? `-${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-text-secondary font-sans font-normal ml-1">mineCoin</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

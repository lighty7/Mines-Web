import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Key, Mail, Lock, X, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { useAudio } from '../../hooks/useAudio'

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, isLoading, errorMessage } = useAdminStore()
  const { playClick } = useAudio()

  const [method, setMethod] = useState<'key' | 'credentials'>('key')
  const [adminKey, setAdminKey] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()

    let success = false
    if (method === 'key') {
      success = await login({ key: adminKey })
    } else {
      success = await login({ email, password })
    }

    if (success) {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-panel border-2 border-red-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-text-primary"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent-red/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-tile transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-red/15 border border-accent-red/40 flex items-center justify-center text-accent-red shadow-lg shadow-accent-red/20 flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wider text-text-primary uppercase flex items-center gap-2">
              Command Gateway
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red font-mono border border-accent-red/30">
                RESTRICTED
              </span>
            </h2>
            <p className="text-xs text-text-secondary">Authenticate with administrator privileges</p>
          </div>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-2 gap-2 bg-tile p-1 rounded-xl border border-tile-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              playClick()
              setMethod('key')
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              method === 'key'
                ? 'bg-accent-red text-white shadow-md shadow-accent-red/30 font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Master Passcode
          </button>
          <button
            type="button"
            onClick={() => {
              playClick()
              setMethod('credentials')
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              method === 'credentials'
                ? 'bg-accent-red text-white shadow-md shadow-accent-red/30 font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Admin Email
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-red/15 border border-accent-red/40 text-accent-red text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {method === 'key' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-accent-gold" />
                Master Admin Secret Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter ADMIN_SECRET_KEY..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-tile border border-tile-border focus:border-accent-red rounded-xl px-3.5 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-text-muted">
                Configured in backend environment variables (e.g. mines-admin-secret-2026)
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-tile border border-tile-border focus:border-accent-red rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-accent-red" />
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-tile border border-tile-border focus:border-accent-red rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || (method === 'key' ? !adminKey.trim() : !email || !password)}
            className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Access Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

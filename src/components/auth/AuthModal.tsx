import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User as UserIcon, Home, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage } from '../../api/client'
import { useAudio } from '../../hooks/useAudio'

interface AuthModalProps {
  isOpen: boolean
  initialTab?: 'signin' | 'register'
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialTab = 'signin', onClose }) => {
  const { setAuth } = useAuthStore()
  const { playClick } = useAudio()

  const [tab, setTab] = useState<'signin' | 'register'>(initialTab)
  const [isForgot, setIsForgot] = useState<boolean>(false)

  // Sign in state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Register state
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regOtpStep, setRegOtpStep] = useState(false)
  const [regOtpCode, setRegOtpCode] = useState('')
  const [regTimer, setRegTimer] = useState(0)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState<0 | 1>(0)
  const [forgotOtpCode, setForgotOtpCode] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotTimer, setForgotTimer] = useState(0)

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Timers countdown
  useEffect(() => {
    if (regTimer > 0) {
      const timer = setTimeout(() => setRegTimer((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [regTimer])

  useEffect(() => {
    if (forgotTimer > 0) {
      const timer = setTimeout(() => setForgotTimer((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [forgotTimer])

  useEffect(() => {
    setTab(initialTab)
    setErrorMsg(null)
    setSuccessMsg(null)
  }, [initialTab, isOpen])

  if (!isOpen) return null

  // Handler: Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await authApi.login(signInEmail, signInPassword)
      setAuth(res.token, res.user)
      onClose()
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  // Handler: Send Registration OTP
  const handleSendRegOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await authApi.sendOtp(regEmail, 'account verification')
      setSuccessMsg(res.message || 'Verification code sent to your email')
      setRegOtpStep(true)
      setRegTimer(60)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  // Handler: Verify OTP & Register
  const handleVerifyRegOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    setIsLoading(true)
    setErrorMsg(null)
    try {
      await authApi.verifyOtp(regEmail, regOtpCode)
      const res = await authApi.register(regUsername, regEmail, regPassword, regAddress)
      setAuth(res.token, res.user)
      onClose()
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  // Handler: Forgot Password Step 1
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await authApi.sendOtp(forgotEmail, 'password reset')
      setSuccessMsg(res.message || 'Reset code sent to your email')
      setForgotStep(1)
      setForgotTimer(60)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  // Handler: Forgot Password Step 2 (Reset)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    playClick()
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }
    if (forgotNewPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await authApi.resetPassword(forgotEmail, forgotOtpCode, forgotNewPassword)
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in.')
      setIsForgot(false)
      setSignInEmail(forgotEmail)
      setForgotStep(0)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-panel border border-tile-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-tile-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Feedback Banners */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-accent-red/15 border border-accent-red/40 text-accent-red text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-primary/15 border border-primary/40 text-primary text-xs"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORGOT PASSWORD VIEW */}
        {isForgot ? (
          <div>
            <button
              type="button"
              onClick={() => {
                setIsForgot(false)
                setErrorMsg(null)
              }}
              className="flex items-center gap-1.5 text-xs text-primary font-semibold mb-3 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>

            <h3 className="text-xl font-bold text-text-primary mb-1">Reset Password</h3>
            <p className="text-xs text-text-secondary mb-4">
              {forgotStep === 0
                ? 'Enter your registered email to receive an OTP reset code.'
                : `Enter the 6-digit code sent to ${forgotEmail} and your new password.`}
            </p>

            {forgotStep === 0 ? (
              <form onSubmit={handleForgotSendOtp} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary">Email Address</label>
                  <div className="relative flex items-center mt-1">
                    <Mail className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !forgotEmail}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtpCode}
                    onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2.5 text-center tracking-widest font-mono text-base font-bold text-text-primary focus:outline-none focus:border-primary transition-colors mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">New Password</label>
                  <div className="relative flex items-center mt-1">
                    <Lock className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary">Confirm New Password</label>
                  <div className="relative flex items-center mt-1">
                    <Lock className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || forgotOtpCode.length !== 6 || !forgotNewPassword}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                </button>

                <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                  <button type="button" onClick={() => setForgotStep(0)} className="hover:underline">
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={forgotTimer > 0 || isLoading}
                    onClick={handleForgotSendOtp}
                    className="text-accent-cyan hover:underline disabled:opacity-50"
                  >
                    {forgotTimer > 0 ? `Resend in ${forgotTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            {/* Tab Switcher: Sign In vs Register */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-tile rounded-xl border border-tile-border mb-5">
              <button
                type="button"
                onClick={() => {
                  playClick()
                  setTab('signin')
                  setErrorMsg(null)
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'signin' ? 'bg-primary text-black shadow-md shadow-primary/20' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick()
                  setTab('register')
                  setErrorMsg(null)
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'register' ? 'bg-primary text-black shadow-md shadow-primary/20' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Register / Sign Up
              </button>
            </div>

            {/* SIGN IN TAB */}
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-text-secondary">Email Address</label>
                  <div className="relative flex items-center mt-1">
                    <Mail className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-secondary">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(true)
                        setForgotEmail(signInEmail)
                        setErrorMsg(null)
                      }}
                      className="text-xs text-accent-cyan hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center mt-1">
                    <Lock className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !signInEmail || !signInPassword}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </button>
              </form>
            ) : (
              /* REGISTER TAB */
              !regOtpStep ? (
                <form onSubmit={handleSendRegOtp} className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-text-secondary">Username</label>
                      <span className="text-[10px] text-text-secondary opacity-70">Letters, numbers, underscores</span>
                    </div>
                    <div className="relative flex items-center mt-1">
                      <UserIcon className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Player_123"
                        value={regUsername}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24)
                          setRegUsername(val)
                        }}
                        className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Email Address</label>
                    <div className="relative flex items-center mt-1">
                      <Mail className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Residential Address (Optional)</label>
                    <div className="relative flex items-center mt-1">
                      <Home className="w-4 h-4 text-text-secondary absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="City, Country"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-tile border border-tile-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Confirm</label>
                      <input
                        type="password"
                        required
                        placeholder="Repeat"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full bg-tile border border-tile-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors mt-1"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || regUsername.length < 3 || !regEmail || regPassword.length < 6}
                    className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                /* REGISTRATION OTP VERIFICATION STEP */
                <form onSubmit={handleVerifyRegOtp} className="flex flex-col gap-3">
                  <div className="p-3 bg-tile border border-tile-border rounded-xl">
                    <p className="text-xs text-text-secondary">
                      We sent a 6-digit verification code to <span className="font-bold text-primary">{regEmail}</span>.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={regOtpCode}
                      onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2.5 text-center tracking-widest font-mono text-base font-bold text-text-primary focus:outline-none focus:border-primary transition-colors mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || regOtpCode.length !== 6}
                    className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Create Account'}
                  </button>

                  <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                    <button type="button" onClick={() => setRegOtpStep(false)} className="hover:underline">
                      ← Change Details
                    </button>
                    <button
                      type="button"
                      disabled={regTimer > 0 || isLoading}
                      onClick={handleSendRegOtp}
                      className="text-accent-cyan hover:underline disabled:opacity-50"
                    >
                      {regTimer > 0 ? `Resend in ${regTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

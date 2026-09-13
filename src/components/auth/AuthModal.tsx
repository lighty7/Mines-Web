import React, { useState, useEffect } from 'react'
import { Mail, Lock, User as UserIcon, Home, ArrowLeft } from 'lucide-react'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage } from '../../api/client'
import { useAudio } from '../../hooks/useAudio'
import { Modal } from '../ui/Modal'
import { Tabs } from '../ui/Tabs'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'

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
    setIsForgot(false)
  }, [initialTab, isOpen])

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

  const authTabs = [
    { id: 'signin', label: 'Sign In' },
    { id: 'register', label: 'Create Account' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isForgot ? 'Reset Password' : tab === 'signin' ? 'Welcome Back' : 'Create Account'}
      subtitle={
        isForgot
          ? 'Enter your email to verify and reset your passcode'
          : tab === 'signin'
          ? 'Sign in to access your wallet and verified stats'
          : 'Register for live provably fair multiplayer gaming'
      }
      size="md"
    >
      <div className="flex flex-col gap-4 py-1">
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

        {/* FORGOT PASSWORD VIEW */}
        {isForgot ? (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setIsForgot(false)
                setErrorMsg(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>

            {forgotStep === 0 ? (
              <form onSubmit={handleForgotSendOtp} className="flex flex-col gap-3.5">
                <Input
                  label="Registered Email Address"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isLoading || !forgotEmail}
                  isLoading={isLoading}
                >
                  Send Verification Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
                <Input
                  label="6-Digit Reset Code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={forgotOtpCode}
                  onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center tracking-widest font-mono text-base font-bold"
                />

                <Input
                  label="New Password"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isLoading || forgotOtpCode.length !== 6 || !forgotNewPassword}
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>

                <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                  <button type="button" onClick={() => setForgotStep(0)} className="hover:underline">
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={forgotTimer > 0 || isLoading}
                    onClick={handleForgotSendOtp}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {forgotTimer > 0 ? `Resend in ${forgotTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Tab Switcher */}
            <Tabs
              items={authTabs}
              activeTab={tab}
              onChange={(val) => {
                playClick()
                setTab(val as 'signin' | 'register')
                setErrorMsg(null)
              }}
              size="md"
            />

            {/* SIGN IN TAB */}
            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Password"
                  labelRight={
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(true)
                        setForgotEmail(signInEmail)
                        setErrorMsg(null)
                      }}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Forgot passcode?
                    </button>
                  }
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  fullWidth
                  disabled={isLoading || !signInEmail || !signInPassword}
                  isLoading={isLoading}
                  className="mt-2"
                >
                  Sign In to Casino
                </Button>
              </form>
            ) : (
              /* REGISTER TAB */
              !regOtpStep ? (
                <form onSubmit={handleSendRegOtp} className="flex flex-col gap-3">
                  <Input
                    label="Username"
                    type="text"
                    required
                    placeholder="Player_123"
                    value={regUsername}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24)
                      setRegUsername(val)
                    }}
                    leftIcon={<UserIcon className="w-4 h-4" />}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />

                  <Input
                    label="Residential Address (Optional)"
                    type="text"
                    placeholder="City, Country"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    leftIcon={<Home className="w-4 h-4" />}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Password"
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <Input
                      label="Confirm"
                      type="password"
                      required
                      placeholder="Repeat"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    fullWidth
                    disabled={isLoading || regUsername.length < 3 || !regEmail || regPassword.length < 6}
                    isLoading={isLoading}
                    className="mt-2"
                  >
                    Send Verification Code
                  </Button>
                </form>
              ) : (
                /* REGISTRATION OTP STEP */
                <form onSubmit={handleVerifyRegOtp} className="flex flex-col gap-3.5">
                  <div className="p-3 bg-surface-3 border border-border-default rounded-xl">
                    <p className="text-xs text-text-secondary">
                      Enter the 6-digit code sent to <span className="font-bold text-primary">{regEmail}</span>.
                    </p>
                  </div>

                  <Input
                    label="6-Digit Verification Code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center tracking-widest font-mono text-base font-bold"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    fullWidth
                    disabled={isLoading || regOtpCode.length !== 6}
                    isLoading={isLoading}
                    className="mt-2"
                  >
                    Verify & Create Account
                  </Button>

                  <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                    <button type="button" onClick={() => setRegOtpStep(false)} className="hover:underline">
                      ← Change Details
                    </button>
                    <button
                      type="button"
                      disabled={regTimer > 0 || isLoading}
                      onClick={handleSendRegOtp}
                      className="text-primary hover:underline disabled:opacity-50"
                    >
                      {regTimer > 0 ? `Resend in ${regTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

import React, { useState } from 'react'
import { Key, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { useAudio } from '../../hooks/useAudio'
import { Modal } from '../ui/Modal'
import { Tabs } from '../ui/Tabs'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'

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

  const methodTabs = [
    { id: 'key', label: 'Master Passcode', icon: <Key className="w-3.5 h-3.5" /> },
    { id: 'credentials', label: 'Admin Email', icon: <Mail className="w-3.5 h-3.5" /> },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Command Gateway"
      subtitle="Restricted zone: Authenticate with administrator credentials"
      size="md"
      variant="danger"
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Method Selector */}
        <Tabs
          items={methodTabs}
          activeTab={method}
          onChange={(val) => {
            playClick()
            setMethod(val as 'key' | 'credentials')
          }}
          size="md"
        />

        {/* Error Notice */}
        {errorMessage && (
          <Alert variant="error">
            {errorMessage}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {method === 'key' ? (
            <div className="flex flex-col gap-1.5">
              <Input
                label="Master Admin Secret Passcode"
                type="password"
                required
                placeholder="Enter ADMIN_SECRET_KEY..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                leftIcon={<Key className="w-4 h-4 text-accent-gold" />}
              />
              <span className="text-[11px] text-text-muted">
                Configured in backend environment variables (e.g. mines-admin-secret-2026)
              </span>
            </div>
          ) : (
            <>
              <Input
                label="Admin Email"
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-primary" />}
              />

              <Input
                label="Admin Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-danger" />}
              />
            </>
          )}

          <Button
            type="submit"
            variant="danger"
            size="xl"
            fullWidth
            disabled={isLoading || (method === 'key' ? !adminKey.trim() : !email || !password)}
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-2"
          >
            Access Command Center
          </Button>
        </form>
      </div>
    </Modal>
  )
}

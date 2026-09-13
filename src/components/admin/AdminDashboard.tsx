import React, { useEffect, useState } from 'react'
import {
  Shield,
  BarChart3,
  Activity,
  Users,
  Server,
  RefreshCw,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { useAudio } from '../../hooks/useAudio'
import { AdminPlayer, UnifiedActiveRound } from '../../api/admin.api'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Alert } from '../ui/Alert'

// Modular Tabs
import { OverviewTab } from './tabs/OverviewTab'
import { LiveRoundsTab } from './tabs/LiveRoundsTab'
import { PlayersTab } from './tabs/PlayersTab'
import { SystemTab } from './tabs/SystemTab'

// Modular Intervention Modals
import { AdjustBalanceModal } from './modals/AdjustBalanceModal'
import { DeleteUserModal } from './modals/DeleteUserModal'
import { StopRoundModal } from './modals/StopRoundModal'
import { EmergencyStopModal } from './modals/EmergencyStopModal'

interface AdminDashboardProps {
  onExit: () => void
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const {
    adminUser,
    stats,
    dashboard,
    users,
    totalUsers,
    currentPage,
    totalPages,
    searchTerm,
    statusFilter,
    errorMessage,
    activeRounds,
    activeRoundsFilter,
    isStoppingRound,
    fetchStats,
    fetchDashboard,
    fetchUsers,
    fetchActiveRounds,
    setActiveRoundsFilter,
    stopRound,
    stopAllRounds,
    setSearchTerm,
    setStatusFilter,
    toggleBan,
    adjustBalance,
    deleteUser,
    logout,
  } = useAdminStore()

  const { playClick } = useAudio()

  const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'players' | 'system'>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals state
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<AdminPlayer | null>(null)
  const [isSavingBalance, setIsSavingBalance] = useState(false)

  const [userToDelete, setUserToDelete] = useState<AdminPlayer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [selectedRoundForStop, setSelectedRoundForStop] = useState<UnifiedActiveRound | null>(null)
  const [isConfirmingStopAll, setIsConfirmingStopAll] = useState<boolean>(false)
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(5)
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null)

  // Polling for stats and live rounds
  useEffect(() => {
    fetchStats()
    fetchDashboard()
    fetchUsers(1)
    fetchActiveRounds()

    const interval = setInterval(() => {
      fetchStats()
      fetchDashboard()
    }, 15000)

    return () => clearInterval(interval)
  }, [fetchStats, fetchDashboard, fetchUsers, fetchActiveRounds])

  // Live rounds dedicated auto-refresh timer
  useEffect(() => {
    if (activeTab === 'live') {
      fetchActiveRounds()
      if (autoRefreshSecs > 0) {
        const interval = setInterval(() => {
          fetchActiveRounds()
        }, autoRefreshSecs * 1000)
        return () => clearInterval(interval)
      }
    }
  }, [activeTab, autoRefreshSecs, fetchActiveRounds])

  const handleManualRefresh = async () => {
    playClick()
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchDashboard(), fetchUsers(currentPage), fetchActiveRounds()])
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleExecuteStopRound = async (action: 'REFUND' | 'CASHOUT', reason: string) => {
    if (!selectedRoundForStop) return
    playClick()
    const ok = await stopRound(
      selectedRoundForStop.gameType,
      selectedRoundForStop.id,
      action,
      reason
    )
    if (ok) {
      setActionSuccessMessage(
        `Round ${selectedRoundForStop.id.slice(-6)} (${selectedRoundForStop.gameType}) successfully ${
          action === 'REFUND' ? 'refunded' : 'cashed out'
        } for player ${selectedRoundForStop.username}`
      )
      setTimeout(() => setActionSuccessMessage(null), 4000)
    }
    setSelectedRoundForStop(null)
  }

  const handleExecuteStopAll = async (reason: string) => {
    playClick()
    const ok = await stopAllRounds(activeRoundsFilter, reason)
    if (ok) {
      setActionSuccessMessage('Emergency Stop executed: all matching active rounds stopped and refunded.')
      setTimeout(() => setActionSuccessMessage(null), 4000)
    }
    setIsConfirmingStopAll(false)
  }

  const handleBanToggle = async (user: AdminPlayer) => {
    playClick()
    const willBan = !user.isBanned
    await toggleBan(user.id, willBan, willBan ? 'Suspended by admin' : undefined)
  }

  const handleConfirmAdjustBalance = async (
    amount: number,
    operation: 'CREDIT' | 'DEBIT' | 'SET',
    reason: string
  ) => {
    if (!selectedUserForBalance) return
    playClick()
    setIsSavingBalance(true)
    await adjustBalance(selectedUserForBalance.id, amount, operation, reason)
    setIsSavingBalance(false)
    setSelectedUserForBalance(null)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    playClick()
    setIsDeleting(true)
    await deleteUser(userToDelete.id)
    setIsDeleting(false)
    setUserToDelete(null)
  }

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      {/* Top Header */}
      <header className="w-full bg-surface-1 border-b border-border-default px-4 lg:px-8 py-3.5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-danger to-rose-600 flex items-center justify-center text-white shadow-lg shadow-danger/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-text-primary uppercase leading-none">
                  Command Center
                </h1>
                <Badge variant="danger" size="sm">
                  {adminUser?.username || 'ROOT ADMIN'}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Live PostgreSQL & Casino Cluster Connected</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleManualRefresh}
              title="Refresh Data"
              className="p-2 rounded-xl bg-surface-2 border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={onExit}
            >
              Back to Games
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              onClick={() => {
                logout()
                onExit()
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3.5 flex items-center gap-2 border-t border-border-subtle pt-3">
          {[
            { id: 'overview' as const, label: 'Analytics & Pots', icon: BarChart3 },
            {
              id: 'live' as const,
              label: 'Live Active Rounds',
              icon: Activity,
              badge: activeRounds.length > 0 ? activeRounds.length : undefined,
            },
            {
              id: 'players' as const,
              label: 'User Directory',
              icon: Users,
              badge: totalUsers > 0 ? totalUsers : undefined,
            },
            { id: 'system' as const, label: 'System & Health', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playClick()
                  setActiveTab(tab.id)
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-surface-3 text-primary border border-border-default shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <Badge variant={tab.id === 'live' && tab.badge > 0 ? 'warning' : 'neutral'} size="sm">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Tab Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col gap-6">
        {/* Intervention / Status Notification */}
        {actionSuccessMessage && (
          <Alert variant="success">
            {actionSuccessMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="error">
            {errorMessage}
          </Alert>
        )}

        {/* Active Tab Router */}
        {activeTab === 'overview' && <OverviewTab stats={stats} dashboard={dashboard} />}

        {activeTab === 'live' && (
          <LiveRoundsTab
            activeRounds={activeRounds}
            activeRoundsFilter={activeRoundsFilter}
            setActiveRoundsFilter={setActiveRoundsFilter}
            autoRefreshSecs={autoRefreshSecs}
            setAutoRefreshSecs={setAutoRefreshSecs}
            fetchActiveRounds={fetchActiveRounds}
            onSelectRoundForStop={(round) => setSelectedRoundForStop(round)}
            onTriggerEmergencyStop={() => setIsConfirmingStopAll(true)}
            isStoppingRound={isStoppingRound}
          />
        )}

        {activeTab === 'players' && (
          <PlayersTab
            users={users}
            totalUsers={totalUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onPageChange={(page) => fetchUsers(page)}
            onToggleBan={handleBanToggle}
            onAdjustBalance={(player) => setSelectedUserForBalance(player)}
            onDeleteUser={(player) => setUserToDelete(player)}
          />
        )}

        {activeTab === 'system' && <SystemTab />}
      </main>

      {/* Intervention Modals */}
      <AdjustBalanceModal
        user={selectedUserForBalance}
        onClose={() => setSelectedUserForBalance(null)}
        onConfirm={handleConfirmAdjustBalance}
        isLoading={isSavingBalance}
      />

      <DeleteUserModal
        user={userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <StopRoundModal
        round={selectedRoundForStop}
        onClose={() => setSelectedRoundForStop(null)}
        onConfirm={handleExecuteStopRound}
        isLoading={isStoppingRound}
      />

      <EmergencyStopModal
        isOpen={isConfirmingStopAll}
        onClose={() => setIsConfirmingStopAll(false)}
        scope={activeRoundsFilter}
        activeCount={activeRounds.length}
        totalRefund={activeRounds.reduce((acc, r) => acc + (r.bet || 0), 0)}
        onConfirm={handleExecuteStopAll}
        isLoading={isStoppingRound}
      />
    </div>
  )
}

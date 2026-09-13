import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Coins,
  Users,
  Activity,
  TrendingUp,
  Search,
  Ban,
  CheckCircle2,
  Trash2,
  Edit3,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Server,
  AlertTriangle,
  Loader2,
  Percent,
  BarChart3,
  Trophy,
  Flame,
  History,
  Sparkles,
  Layers,
  StopCircle,
  DollarSign,
  Clock,
} from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { useAudio } from '../../hooks/useAudio'
import { AdminPlayer, UnifiedActiveRound } from '../../api/admin.api'

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
    isLoading,
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

  // Balance adjustment modal state
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<AdminPlayer | null>(null)
  const [adjustAmount, setAdjustAmount] = useState<number>(100)
  const [adjustOp, setAdjustOp] = useState<'CREDIT' | 'DEBIT' | 'SET'>('CREDIT')
  const [adjustReason, setAdjustReason] = useState('Admin manual credit')
  const [isSavingBalance, setIsSavingBalance] = useState(false)

  // Delete confirmation modal state
  const [userToDelete, setUserToDelete] = useState<AdminPlayer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Active Rounds management state
  const [selectedRoundForStop, setSelectedRoundForStop] = useState<UnifiedActiveRound | null>(null)
  const [stopActionType, setStopActionType] = useState<'REFUND' | 'CASHOUT'>('REFUND')
  const [stopReason, setStopReason] = useState<string>('Terminated by administrator')
  const [isConfirmingStopAll, setIsConfirmingStopAll] = useState<boolean>(false)
  const [stopAllReason, setStopAllReason] = useState<string>('Emergency platform maintenance')
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(5)
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null)

  // Initial load and periodic stats poll
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
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const handleExecuteStopRound = async () => {
    if (!selectedRoundForStop) return
    playClick()
    const ok = await stopRound(
      selectedRoundForStop.gameType,
      selectedRoundForStop.id,
      stopActionType,
      stopReason
    )
    if (ok) {
      setActionSuccessMessage(
        `Round ${selectedRoundForStop.id.slice(-6)} (${selectedRoundForStop.gameType}) successfully ${
          stopActionType === 'REFUND' ? 'refunded' : 'cashed out'
        } for player ${selectedRoundForStop.username}`
      )
      setTimeout(() => setActionSuccessMessage(null), 4000)
    }
    setSelectedRoundForStop(null)
  }

  const handleExecuteStopAll = async () => {
    playClick()
    const ok = await stopAllRounds(activeRoundsFilter, stopAllReason)
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

  const handleConfirmAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForBalance) return
    playClick()
    setIsSavingBalance(true)
    await adjustBalance(selectedUserForBalance.id, adjustAmount, adjustOp, adjustReason)
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

  // Analytics derived helpers
  const overview = dashboard?.overview ?? {
    mainPot: stats?.mainPot ?? 0,
    totalWagered: stats?.totalWagered ?? 0,
    totalPayout: stats?.totalPayout ?? 0,
    houseProfit: stats?.houseProfit ?? 0,
    todayWagered: 0,
    todayProfit: 0,
    realizedRtp: 99.0,
    totalRounds: stats?.totalRounds ?? 0,
    wonRounds: stats?.wonRounds ?? 0,
    lostRounds: stats?.lostRounds ?? 0,
    winRate: 0,
    averageBet: 0,
    activePlayersCount: stats?.activePlayersCount ?? 0,
    totalUsersCount: stats?.totalUsersCount ?? 0,
    bannedUsersCount: stats?.bannedUsersCount ?? 0,
    newUsersLast7Days: 0,
  }

  const chartData = dashboard?.chart7Days ?? []
  const maxWageredInChart = Math.max(...chartData.map((d) => d.wagered), 100)

  const gridDist = dashboard?.gridDistribution ?? { '4x4': 0, '5x5': 0, '6x6': 0 }
  const totalGridGames = (gridDist['4x4'] + gridDist['5x5'] + gridDist['6x6']) || 1
  const pct4 = Math.round((gridDist['4x4'] / totalGridGames) * 100)
  const pct5 = Math.round((gridDist['5x5'] / totalGridGames) * 100)
  const pct6 = Math.round((gridDist['6x6'] / totalGridGames) * 100)

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Top Admin Header */}
      <header className="w-full bg-panel border-b border-tile-border px-4 lg:px-8 py-3.5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-text-primary uppercase leading-none">
                  Command Center
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red border border-accent-red/30">
                  {adminUser?.username || 'ROOT ADMIN'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Live PostgreSQL Database & Server Active</span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              title="Refresh Data"
              className="p-2 rounded-xl bg-tile border border-tile-border text-text-secondary hover:text-text-primary hover:bg-tile-hover transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={() => {
                playClick()
                onExit()
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-tile border border-tile-border hover:bg-tile-hover text-xs font-semibold text-text-primary transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span>Back to Game</span>
            </button>

            <button
              onClick={() => {
                playClick()
                logout()
                onExit()
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-red/15 border border-accent-red/40 hover:bg-accent-red/25 text-xs font-semibold text-accent-red transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6 flex-1">
        {errorMessage && (
          <div className="p-3 bg-accent-red/15 border border-accent-red/40 rounded-xl text-accent-red text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-tile-border pb-3 flex-wrap">
          <button
            onClick={() => {
              playClick()
              setActiveTab('overview')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-tile text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </button>

          <button
            onClick={() => {
              playClick()
              setActiveTab('live')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'live'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-tile text-text-secondary hover:text-text-primary'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Rounds ({stats?.activeRounds?.length ?? 0})
            {overview.activePlayersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              playClick()
              setActiveTab('players')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'players'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-tile text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            Player Directory ({totalUsers})
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-current ml-1" />}
          </button>

          <button
            onClick={() => {
              playClick()
              setActiveTab('system')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'system'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-tile text-text-secondary hover:text-text-primary'
            }`}
          >
            <Server className="w-4 h-4" />
            System Health
          </button>
        </div>

        {/* TAB 1: EXECUTIVE ANALYTICS DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* 4 Core KPI Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Main Pot */}
              <div className="p-5 rounded-2xl bg-panel border-2 border-accent-gold/40 shadow-xl shadow-accent-gold/10 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/10 blur-2xl pointer-events-none rounded-full" />
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-accent-gold" />
                    The Main Pot
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold text-[10px] font-mono font-bold">
                    CIRCULATING
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-accent-gold mt-1">
                  {overview.mainPot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">mineCoin</span>
                </div>
                <p className="text-[11px] text-text-muted">Total sum of all player account balances circulating</p>
              </div>

              {/* Card 2: Today's Volume */}
              <div className="p-5 rounded-2xl bg-panel border border-primary/40 shadow-xl shadow-primary/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-primary" />
                    24h Volume & Net
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold">
                    TODAY
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-primary mt-1">
                  {overview.todayWagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">wagered</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>Today's Profit:</span>
                  <span className={`font-mono font-bold ${overview.todayProfit >= 0 ? 'text-emerald-400' : 'text-accent-red'}`}>
                    {overview.todayProfit >= 0 ? '+' : ''}{overview.todayProfit.toFixed(2)} mineCoin
                  </span>
                </div>
              </div>

              {/* Card 3: House Profit & Realized RTP */}
              <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Total GGR & RTP
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                    {overview.realizedRtp}% RTP
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                  {overview.houseProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">mineCoin</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>Player Win Rate:</span>
                  <span className="font-mono font-bold text-text-primary">{overview.winRate}% ({overview.wonRounds}W / {overview.lostRounds}L)</span>
                </div>
              </div>

              {/* Card 4: Registered & Active Players */}
              <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-accent-cyan" />
                    Player Base
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-tile border border-tile-border text-[10px] font-mono text-text-secondary">
                    +{overview.newUsersLast7Days} this week
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-text-primary mt-1">
                  {overview.totalUsersCount}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">accounts</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span>Playing now:</span>
                  <span className="font-mono font-bold text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    {overview.activePlayersCount} active sessions
                  </span>
                </div>
              </div>
            </div>

            {/* 7-Day Performance & Trends Bar Chart */}
            <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">
                    7-Day Volume & House Profit Trends
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-primary/80" />
                    <span>Wagered Volume</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-accent-gold/80" />
                    <span>House Profit</span>
                  </div>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="flex items-end justify-between gap-2 pt-8 pb-2 h-48 border-b border-tile-border/50">
                  {chartData.map((d) => {
                    const wagerHeight = Math.max(10, Math.min(100, Math.round((d.wagered / maxWageredInChart) * 100)))
                    const profitHeight = Math.max(6, Math.min(100, Math.round((Math.max(0, d.profit) / maxWageredInChart) * 100)))
                    const dateFormatted = new Date(d.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'numeric',
                      day: 'numeric',
                    })

                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-black/90 border border-tile-border px-2.5 py-1.5 rounded-xl shadow-xl text-[10px] font-mono text-center whitespace-nowrap">
                          <div className="font-bold text-text-primary">{dateFormatted}</div>
                          <div className="text-primary font-bold">Wager: {d.wagered.toFixed(2)}</div>
                          <div className="text-accent-gold font-bold">Profit: {d.profit.toFixed(2)}</div>
                          <div className="text-text-muted">{d.rounds} rounds</div>
                        </div>

                        {/* Bars Container */}
                        <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                          {/* Wagered Bar */}
                          <div
                            style={{ height: `${wagerHeight}%` }}
                            className="w-1/2 bg-gradient-to-t from-primary/40 to-primary rounded-t-md transition-all duration-500 group-hover:brightness-125"
                          />
                          {/* Profit Bar */}
                          <div
                            style={{ height: `${profitHeight}%` }}
                            className="w-1/2 bg-gradient-to-t from-accent-gold/40 to-accent-gold rounded-t-md transition-all duration-500 group-hover:brightness-125"
                          />
                        </div>

                        {/* Date Label */}
                        <span className="text-[10px] font-mono text-text-secondary mt-2 truncate w-full text-center">
                          {dateFormatted}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-text-muted text-xs">
                  Gathering 7-day trend metrics...
                </div>
              )}
            </div>

            {/* Grid Size Distribution & Jackpot of All Time */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Grid Distribution (1 Col) */}
              <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-sm font-bold text-text-primary">Grid Size Popularity</h3>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  {/* 4x4 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-text-secondary font-semibold">4x4 Quick Grid (16 Tiles)</span>
                      <span className="font-bold text-purple-400">{gridDist['4x4']} rounds ({pct4}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-tile overflow-hidden">
                      <div style={{ width: `${pct4}%` }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                    </div>
                  </div>

                  {/* 5x5 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-text-secondary font-semibold">5x5 Classic Standard (25 Tiles)</span>
                      <span className="font-bold text-primary">{gridDist['5x5']} rounds ({pct5}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-tile overflow-hidden">
                      <div style={{ width: `${pct5}%` }} className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* 6x6 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-text-secondary font-semibold">6x6 High Stakes (36 Tiles)</span>
                      <span className="font-bold text-accent-gold">{gridDist['6x6']} rounds ({pct6}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-tile overflow-hidden">
                      <div style={{ width: `${pct6}%` }} className="h-full bg-gradient-to-r from-accent-gold to-amber-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-text-muted mt-auto pt-2 border-t border-tile-border/40">
                  Calculated across {totalGridGames} total recorded player rounds.
                </p>
              </div>

              {/* Highest Win Jackpot Showcase (1 Col) */}
              <div className="p-5 rounded-2xl bg-panel border-2 border-accent-gold/40 shadow-xl shadow-accent-gold/10 flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 blur-3xl pointer-events-none rounded-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent-gold" />
                    <h3 className="text-sm font-bold text-accent-gold uppercase tracking-wider">
                      Jackpot of All Time
                    </h3>
                  </div>
                  <Sparkles className="w-4 h-4 text-accent-gold animate-pulse" />
                </div>

                {dashboard?.highestWin ? (
                  <div className="flex flex-col gap-2 my-auto">
                    <span className="text-xs text-text-secondary font-semibold">All-Time Record Winner</span>
                    <div className="text-xl font-black text-text-primary flex items-center gap-2">
                      <span>{dashboard.highestWin.username}</span>
                      <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-mono font-bold border border-accent-gold/30">
                        {dashboard.highestWin.multiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div className="text-3xl font-black font-mono text-accent-gold mt-1">
                      {dashboard.highestWin.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-xs font-sans font-normal text-text-secondary ml-1">mineCoin</span>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono">
                      Won on {new Date(dashboard.highestWin.createdAt).toLocaleDateString()} at {new Date(dashboard.highestWin.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ) : (
                  <div className="py-6 text-center text-text-muted text-xs my-auto">
                    No recorded wins yet. The first big payout will be spotlighted here!
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-accent-gold/80 bg-accent-gold/10 p-2.5 rounded-xl border border-accent-gold/20">
                  <Flame className="w-3.5 h-3.5 flex-shrink-0 text-accent-gold" />
                  <span>Fairness backed by SHA-256 verifiable seed hashes.</span>
                </div>
              </div>

              {/* Top Winners High-Roller Board (1 Col) */}
              <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-text-primary">Top Winners Leaderboard</h3>
                </div>

                {dashboard?.topWinners && dashboard.topWinners.length > 0 ? (
                  <div className="flex flex-col gap-2 divide-y divide-tile-border/40">
                    {dashboard.topWinners.map((w, idx) => (
                      <div key={w.id} className="pt-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                              idx === 0
                                ? 'bg-accent-gold text-black'
                                : idx === 1
                                ? 'bg-slate-300 text-black'
                                : idx === 2
                                ? 'bg-amber-600 text-white'
                                : 'bg-tile text-text-secondary'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-text-primary">{w.username}</span>
                        </div>
                        <div className="font-mono text-right">
                          <div className="font-bold text-primary">{w.balance.toFixed(2)} mineCoin</div>
                          <div className="text-[10px] text-text-muted">
                            {w.totalProfit >= 0 ? `+${w.totalProfit.toFixed(0)} profit` : `${w.totalProfit.toFixed(0)}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-text-muted text-xs">
                    No leaderboard data available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Platform Activity Audit Log (Last 15 Events) */}
            <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">Platform Activity Audit Log</h3>
                </div>
                <span className="text-xs text-text-secondary font-mono">Last 15 Live Transactions</span>
              </div>

              {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-tile-border text-text-secondary font-semibold">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tile-border/40 font-mono">
                      {dashboard.recentActivity.map((tx) => (
                        <tr key={tx.id} className="hover:bg-tile/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                tx.type === 'WIN'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : tx.type === 'BET'
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                  : tx.type === 'ADMIN_ADJUST'
                                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                                  : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans font-bold text-text-primary">
                            {tx.username}
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            <span
                              className={
                                tx.amount > 0
                                  ? 'text-emerald-400'
                                  : tx.amount < 0
                                  ? 'text-accent-red'
                                  : 'text-text-primary'
                              }
                            >
                              {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} mineCoin
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-text-muted text-[11px]">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-text-muted text-xs">
                  No activity transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ACTIVE ROUNDS STREAM & CONTROLS */}
        {activeTab === 'live' && (
          <div className="flex flex-col gap-6">
            {actionSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{actionSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setActionSuccessMessage(null)}
                  className="text-text-muted hover:text-white"
                >
                  ✕
                </button>
              </motion.div>
            )}

            {/* Metrics and Emergency Actions Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Stat 1: Total Active Sessions */}
              <div className="p-4 rounded-2xl bg-panel border border-tile-border flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-text-secondary font-semibold block">Active Sessions</span>
                  <span className="text-xl font-black text-white font-mono mt-0.5 block">
                    {activeRounds.length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              {/* Stat 2: Active Stakes at Risk */}
              <div className="p-4 rounded-2xl bg-panel border border-tile-border flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-text-secondary font-semibold block">Live Stakes at Risk</span>
                  <span className="text-xl font-black text-accent-gold font-mono mt-0.5 block">
                    ${activeRounds.reduce((acc, r) => acc + (r.bet || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Stat 3: Max Potential Exposure */}
              <div className="p-4 rounded-2xl bg-panel border border-tile-border flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-text-secondary font-semibold block">Potential Exposure</span>
                  <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                    ${activeRounds.reduce((acc, r) => acc + (r.potentialWin || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Emergency Stop All Action */}
              <div className="p-4 rounded-2xl bg-accent-red/10 border border-accent-red/40 flex flex-col justify-between gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-accent-red font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent-red" />
                    Panic Switch
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">{activeRounds.length} live</span>
                </div>
                <button
                  onClick={() => {
                    playClick()
                    setIsConfirmingStopAll(true)
                  }}
                  disabled={activeRounds.length === 0 || isStoppingRound}
                  className="w-full py-2 px-3 rounded-xl bg-accent-red hover:bg-accent-red/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-accent-red/20 cursor-pointer transition-all"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop All Live Rounds</span>
                </button>
              </div>
            </div>

            {/* Filter & Stream Controls Container */}
            <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-tile-border/60 pb-3">
                {/* Game filter tabs */}
                <div className="flex items-center gap-1.5 bg-tile p-1 rounded-xl border border-tile-border text-xs font-semibold">
                  {[
                    { id: 'ALL', label: 'All Games' },
                    { id: 'mines', label: '💣 Mines' },
                    { id: 'coinflip', label: '🪙 Coin Flip' },
                    { id: 'blackjack', label: '🃏 Blackjack' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        playClick()
                        setActiveRoundsFilter(filter.id as any)
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeRoundsFilter === filter.id
                          ? 'bg-primary text-black font-bold shadow'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Auto-Refresh Timer Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-text-secondary font-semibold">Auto-Refresh:</span>
                  <div className="flex items-center gap-1 bg-tile p-1 rounded-lg border border-tile-border font-mono text-[11px]">
                    {[
                      { s: 3, l: '3s' },
                      { s: 5, l: '5s' },
                      { s: 10, l: '10s' },
                      { s: 0, l: 'Off' },
                    ].map((rate) => (
                      <button
                        key={rate.l}
                        onClick={() => {
                          playClick()
                          setAutoRefreshSecs(rate.s)
                        }}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          autoRefreshSecs === rate.s
                            ? 'bg-tile-border text-white font-bold'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {rate.l}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      playClick()
                      fetchActiveRounds()
                    }}
                    title="Refresh Now"
                    className="p-1.5 rounded-lg bg-tile border border-tile-border text-text-secondary hover:text-white hover:bg-tile-hover ml-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Rounds Table */}
              {activeRounds && activeRounds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-tile-border text-text-secondary font-semibold">
                        <th className="py-2.5 px-3">Game</th>
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">Wager</th>
                        <th className="py-2.5 px-3">Live State / Hand</th>
                        <th className="py-2.5 px-3">Multiplier</th>
                        <th className="py-2.5 px-3">Potential Win</th>
                        <th className="py-2.5 px-3">Elapsed</th>
                        <th className="py-2.5 px-3 text-right">Intervention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tile-border/50 font-mono">
                      {activeRounds.map((round) => {
                        const gameIcon =
                          round.gameType === 'coinflip' ? '🪙' : round.gameType === 'blackjack' ? '🃏' : '💣'
                        const gameBadgeColor =
                          round.gameType === 'coinflip'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : round.gameType === 'blackjack'
                            ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'

                        const canForceCashout =
                          (round.gameType === 'mines' && (round.revealedCount || 0) > 0) ||
                          (round.gameType === 'coinflip' && (round.streak || 0) > 0)

                        return (
                          <tr key={`${round.gameType}-${round.id}`} className="hover:bg-tile/50 transition-colors">
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase ${gameBadgeColor}`}
                              >
                                <span>{gameIcon}</span>
                                <span>{round.gameType}</span>
                              </span>
                            </td>

                            <td className="py-3 px-3 font-sans">
                              <div className="font-bold text-text-primary">{round.username}</div>
                              <div className="text-[10px] text-text-muted truncate max-w-[140px]">
                                {round.email}
                              </div>
                            </td>

                            <td className="py-3 px-3 font-bold text-accent-gold">
                              ${round.bet.toFixed(2)}
                            </td>

                            <td className="py-3 px-3 font-sans text-xs text-text-secondary">
                              <span className="bg-tile/80 px-2 py-1 rounded-md border border-tile-border/60">
                                {round.stateSummary}
                              </span>
                            </td>

                            <td className="py-3 px-3 font-bold text-primary">
                              {round.multiplier.toFixed(2)}x
                            </td>

                            <td className="py-3 px-3 font-bold text-emerald-400">
                              ${round.potentialWin.toFixed(2)}
                            </td>

                            <td className="py-3 px-3 text-text-muted text-[11px]">
                              {new Date(round.createdAt).toLocaleTimeString()}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {canForceCashout && (
                                  <button
                                    onClick={() => {
                                      playClick()
                                      setSelectedRoundForStop(round)
                                      setStopActionType('CASHOUT')
                                      setStopReason('Admin force cashout at current progress')
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    title="Force Cashout at Current Value"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    <span>Cashout</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    playClick()
                                    setSelectedRoundForStop(round)
                                    setStopActionType('REFUND')
                                    setStopReason('Round terminated & refunded by admin')
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-accent-red/15 border border-accent-red/40 hover:bg-accent-red/30 text-accent-red text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Stop and Refund Wager"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Stop & Refund</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-14 flex flex-col items-center justify-center text-center text-text-muted gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-tile border border-tile-border flex items-center justify-center text-xl">
                    🎲
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">No Live Active Rounds In-Flight</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      When players wager on Mines, Coin Flip, or Blackjack, real-time sessions stream here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PLAYER MANAGEMENT */}
        {activeTab === 'players' && (
          <div className="flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-panel p-4 rounded-2xl border border-tile-border">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-tile border border-tile-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1.5 bg-tile p-1 rounded-xl border border-tile-border text-xs font-semibold self-stretch sm:self-auto">
                {(['ALL', 'ACTIVE', 'BANNED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      playClick()
                      setStatusFilter(filter)
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === filter
                        ? 'bg-primary text-black font-bold shadow-md shadow-primary/20'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Players' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Players Table */}
            <div className="bg-panel rounded-2xl border border-tile-border overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-tile/80 border-b border-tile-border text-text-secondary font-semibold">
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Games</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tile-border/40">
                    {users.map((player) => (
                      <tr key={player.id} className="hover:bg-tile/40 transition-colors">
                        {/* Username & Email */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary leading-tight">
                                {player.username}
                              </span>
                              <span className="text-[11px] text-text-muted">{player.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                              player.role === 'ADMIN'
                                ? 'bg-accent-red/15 border-accent-red/40 text-accent-red'
                                : 'bg-tile border-tile-border text-text-secondary'
                            }`}
                          >
                            {player.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {player.isBanned ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-red/20 text-accent-red border border-accent-red/40">
                              <Ban className="w-3 h-3" />
                              BANNED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                              <CheckCircle2 className="w-3 h-3" />
                              ACTIVE
                            </span>
                          )}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {player.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                          <span className="text-[10px] font-sans font-normal text-text-muted">mineCoin</span>
                        </td>

                        {/* Games Played */}
                        <td className="py-3 px-4 font-mono text-text-secondary">
                          {player.gamesCount} rounds
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-4 text-text-muted text-[11px]">
                          {new Date(player.createdAt).toLocaleDateString()}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Ban / Unban Toggle */}
                            <button
                              onClick={() => handleBanToggle(player)}
                              title={player.isBanned ? 'Unban Player' : 'Ban Player'}
                              className={`p-1.5 rounded-lg border transition-all ${
                                player.isBanned
                                  ? 'bg-primary/15 border-primary/40 text-primary hover:bg-primary/25'
                                  : 'bg-accent-red/15 border-accent-red/40 text-accent-red hover:bg-accent-red/25'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Adjust Balance */}
                            <button
                              onClick={() => {
                                playClick()
                                setSelectedUserForBalance(player)
                                setAdjustAmount(100)
                                setAdjustOp('CREDIT')
                              }}
                              title="Adjust Balance"
                              className="p-1.5 rounded-lg bg-tile border border-tile-border text-accent-gold hover:bg-tile-hover transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => {
                                playClick()
                                setUserToDelete(player)
                              }}
                              title="Delete Account"
                              className="p-1.5 rounded-lg bg-tile border border-tile-border text-text-secondary hover:text-accent-red hover:bg-tile-hover transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-tile-border text-xs text-text-secondary">
                  <span>
                    Page {currentPage} of {totalPages} ({totalUsers} total players)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => fetchUsers(currentPage - 1)}
                      className="px-3 py-1 rounded-lg bg-tile border border-tile-border hover:bg-tile-hover disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => fetchUsers(currentPage + 1)}
                      className="px-3 py-1 rounded-lg bg-tile border border-tile-border hover:bg-tile-hover disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM & HEALTH */}
        {activeTab === 'system' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-panel border border-tile-border flex flex-col gap-3">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  Backend Deployment Details
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">Host Service</span>
                    <span className="font-mono text-primary font-bold">Render Free Tier (Node.js)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">API Endpoint</span>
                    <span className="font-mono text-text-primary">https://mines-backend-mex2.onrender.com</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">Database Host</span>
                    <span className="font-mono text-text-primary">Aiven Cloud PostgreSQL</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">Keep-Alive Status</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      14-Minute GitHub Cron Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-panel border border-tile-border flex flex-col gap-3">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Percent className="w-4 h-4 text-accent-gold" />
                  Game Mathematics & Fairness
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">Return to Player (RTP)</span>
                    <span className="font-mono font-bold text-primary">99.0%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">House Edge</span>
                    <span className="font-mono font-bold text-accent-gold">1.0%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">Supported Grids</span>
                    <span className="font-mono text-text-primary font-bold">4x4, 5x5, 6x6</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-tile rounded-xl border border-tile-border">
                    <span className="text-text-secondary">Random Generator</span>
                    <span className="font-mono text-text-primary">Crypto SecureRandom + SHA-256</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADJUST BALANCE MODAL */}
      <AnimatePresence>
        {selectedUserForBalance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-panel border border-tile-border rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs"
            >
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Coins className="w-4 h-4 text-accent-gold" />
                Adjust Player Balance
              </h3>

              <div className="p-3 rounded-xl bg-tile border border-tile-border flex flex-col gap-1">
                <span className="text-text-secondary">Player:</span>
                <span className="font-bold text-text-primary">{selectedUserForBalance.username}</span>
                <span className="text-[11px] text-text-muted">
                  Current Balance: {selectedUserForBalance.balance.toFixed(2)} mineCoin
                </span>
              </div>

              <form onSubmit={handleConfirmAdjustBalance} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-text-secondary font-semibold">Operation</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-tile p-1 rounded-xl border border-tile-border font-bold">
                    {(['CREDIT', 'DEBIT', 'SET'] as const).map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setAdjustOp(op)}
                        className={`py-1.5 rounded-lg text-center transition-all ${
                          adjustOp === op ? 'bg-primary text-black shadow-sm' : 'text-text-secondary'
                        }`}
                      >
                        {op === 'CREDIT' ? '+ Credit' : op === 'DEBIT' ? '- Debit' : 'Set To'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-text-secondary font-semibold">Amount (mineCoin)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-text-secondary font-semibold">Audit Reason</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForBalance(null)}
                    className="px-3 py-2 rounded-xl bg-tile border border-tile-border text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBalance}
                    className="px-4 py-2 rounded-xl bg-primary text-black font-bold shadow-md shadow-primary/20 flex items-center gap-1.5"
                  >
                    {isSavingBalance && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Change
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE USER CONFIRMATION MODAL */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-panel border-2 border-accent-red/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-2.5 text-accent-red">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="text-sm font-bold">Delete Player Account</h3>
              </div>

              <p className="text-text-secondary leading-relaxed">
                Are you sure you want to permanently delete player{' '}
                <span className="font-bold text-text-primary">{userToDelete.username}</span>? This
                will delete all associated games and transactions. This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-3 py-2 rounded-xl bg-tile border border-tile-border text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-accent-red text-white font-bold shadow-md shadow-accent-red/20 flex items-center gap-1.5"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STOP SINGLE ROUND CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedRoundForStop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-panel border-2 border-accent-red/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-2.5 text-accent-red">
                <StopCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">Intervene in Live Active Round</h3>
                  <span className="text-[10px] text-text-secondary font-mono">
                    ID: {selectedRoundForStop.id} · {selectedRoundForStop.gameType.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Round Details Card */}
              <div className="p-3 rounded-xl bg-tile/70 border border-tile-border flex flex-col gap-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-sans">Player:</span>
                  <span className="text-white font-bold">{selectedRoundForStop.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-sans">Wager Placed:</span>
                  <span className="text-accent-gold font-bold">${selectedRoundForStop.bet.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-sans">Current Progress:</span>
                  <span className="text-text-primary">{selectedRoundForStop.stateSummary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-sans">Current Multiplier:</span>
                  <span className="text-primary font-bold">{selectedRoundForStop.multiplier.toFixed(2)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-sans">Accumulated Win:</span>
                  <span className="text-emerald-400 font-bold">${selectedRoundForStop.potentialWin.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary font-semibold">Resolution Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStopActionType('REFUND')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                      stopActionType === 'REFUND'
                        ? 'bg-accent-red/20 border-accent-red text-white'
                        : 'bg-tile border-tile-border text-text-secondary hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs">Refund Bet</span>
                    <span className="text-[10px] opacity-80">
                      Returns ${selectedRoundForStop.bet.toFixed(2)}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedRoundForStop.gameType === 'blackjack' || selectedRoundForStop.multiplier <= 1}
                    onClick={() => setStopActionType('CASHOUT')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                      stopActionType === 'CASHOUT'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-tile border-tile-border text-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <span className="font-bold text-xs">Force Cashout</span>
                    <span className="text-[10px] opacity-80">
                      Pays ${selectedRoundForStop.potentialWin.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Reason Input */}
              <div className="flex flex-col gap-1">
                <label className="text-text-secondary font-semibold">Audit / Customer Reason</label>
                <input
                  type="text"
                  value={stopReason}
                  onChange={(e) => setStopReason(e.target.value)}
                  className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-red"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoundForStop(null)}
                  className="px-3 py-2 rounded-xl bg-tile border border-tile-border text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isStoppingRound}
                  onClick={handleExecuteStopRound}
                  className={`px-4 py-2 rounded-xl text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer ${
                    stopActionType === 'REFUND' ? 'bg-accent-red shadow-accent-red/20' : 'bg-emerald-600 shadow-emerald-600/20'
                  }`}
                >
                  {isStoppingRound && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{stopActionType === 'REFUND' ? 'Confirm Stop & Refund' : 'Confirm Force Cashout'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EMERGENCY STOP ALL CONFIRMATION MODAL */}
      <AnimatePresence>
        {isConfirmingStopAll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-panel border-2 border-accent-red rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-2.5 text-accent-red">
                <AlertTriangle className="w-7 h-7 flex-shrink-0 animate-bounce" />
                <div>
                  <h3 className="text-base font-black text-accent-red uppercase tracking-wider">
                    Emergency Panic Switch: Stop All Rounds
                  </h3>
                  <span className="text-[11px] text-text-secondary">
                    Target scope: {activeRoundsFilter === 'ALL' ? 'All Games' : activeRoundsFilter.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-accent-red/15 border border-accent-red/40 rounded-xl text-accent-red text-xs leading-relaxed">
                <strong>CRITICAL ACTION:</strong> This will immediately cancel all in-flight wagers for the selected game(s), abort active client connections, and atomically refund all players&apos; initial bets back to their balance.
              </div>

              <div className="p-3 rounded-xl bg-tile border border-tile-border flex items-center justify-between font-mono">
                <span className="text-text-secondary font-sans">Active Rounds to Cancel:</span>
                <span className="text-white font-bold text-sm">{activeRounds.length} rounds</span>
              </div>

              <div className="p-3 rounded-xl bg-tile border border-tile-border flex items-center justify-between font-mono">
                <span className="text-text-secondary font-sans">Total Refund Amount:</span>
                <span className="text-accent-gold font-bold text-sm">
                  ${activeRounds.reduce((acc, r) => acc + (r.bet || 0), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-text-secondary font-semibold">Incident / Audit Log Reason</label>
                <input
                  type="text"
                  value={stopAllReason}
                  onChange={(e) => setStopAllReason(e.target.value)}
                  className="w-full bg-tile border border-tile-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-red"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingStopAll(false)}
                  className="px-3 py-2 rounded-xl bg-tile border border-tile-border text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isStoppingRound}
                  onClick={handleExecuteStopAll}
                  className="px-4 py-2.5 rounded-xl bg-accent-red hover:bg-accent-red/90 text-white font-black uppercase tracking-wider shadow-lg shadow-accent-red/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {isStoppingRound && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>EXECUTE EMERGENCY STOP</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

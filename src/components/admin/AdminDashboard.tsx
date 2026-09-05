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
  Bomb,
  Server,
  AlertTriangle,
  Loader2,
  Percent,
} from 'lucide-react'
import { useAdminStore } from '../../store/adminStore'
import { useAudio } from '../../hooks/useAudio'
import { AdminPlayer } from '../../api/admin.api'

interface AdminDashboardProps {
  onExit: () => void
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const {
    adminUser,
    stats,
    users,
    totalUsers,
    currentPage,
    totalPages,
    searchTerm,
    statusFilter,
    isLoading,
    errorMessage,
    fetchStats,
    fetchUsers,
    setSearchTerm,
    setStatusFilter,
    toggleBan,
    adjustBalance,
    deleteUser,
    logout,
  } = useAdminStore()

  const { playClick } = useAudio()

  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'system'>('overview')
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

  // Initial load and periodic stats poll
  useEffect(() => {
    fetchStats()
    fetchUsers(1)

    const interval = setInterval(() => {
      fetchStats()
    }, 15000)

    return () => clearInterval(interval)
  }, [fetchStats, fetchUsers])

  const handleManualRefresh = async () => {
    playClick()
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchUsers(currentPage)])
    setTimeout(() => setIsRefreshing(false), 600)
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
        <div className="flex items-center gap-2 border-b border-tile-border pb-3">
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
            <Activity className="w-4 h-4" />
            Live Overview & The Main Pot
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

        {/* TAB 1: OVERVIEW & MAIN POT */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* 4 KPI Highlights */}
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
                  {(stats?.mainPot ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">mineCoin</span>
                </div>
                <p className="text-[11px] text-text-muted">Total sum of all balances held across all user accounts</p>
              </div>

              {/* Card 2: Live Players */}
              <div className="p-5 rounded-2xl bg-panel border border-primary/40 shadow-xl shadow-primary/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    Playing Now
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    LIVE
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-primary mt-1">
                  {stats?.activePlayersCount ?? 0}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">games in progress</span>
                </div>
                <p className="text-[11px] text-text-muted">Active rounds started within the last 15 minutes</p>
              </div>

              {/* Card 3: House GGR */}
              <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    House Profit (GGR)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                    99.0% RTP
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-text-primary mt-1">
                  {(stats?.houseProfit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">mineCoin</span>
                </div>
                <p className="text-[11px] text-text-muted">Total wagered ({(stats?.totalWagered ?? 0).toFixed(0)}) minus payouts</p>
              </div>

              {/* Card 4: Total Users */}
              <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-text-secondary text-xs">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-accent-cyan" />
                    Registered Players
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-tile border border-tile-border text-[10px] font-mono text-text-secondary">
                    {stats?.bannedUsersCount ?? 0} Banned
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-text-primary mt-1">
                  {stats?.totalUsersCount ?? 0}
                  <span className="text-xs font-sans font-normal text-text-secondary ml-1">total</span>
                </div>
                <p className="text-[11px] text-text-muted">{stats?.totalRounds ?? 0} total rounds played across all time</p>
              </div>
            </div>

            {/* Live Active Games Stream */}
            <div className="p-5 rounded-2xl bg-panel border border-tile-border shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Active Rounds (Real-time Stream)
                </h3>
                <span className="text-xs text-text-secondary font-mono">
                  {stats?.activeRounds?.length ?? 0} Active Sessions
                </span>
              </div>

              {stats?.activeRounds && stats.activeRounds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-tile-border text-text-secondary font-semibold">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">Bet</th>
                        <th className="py-2.5 px-3">Grid & Mines</th>
                        <th className="py-2.5 px-3">Revealed Gems</th>
                        <th className="py-2.5 px-3">Current Multiplier</th>
                        <th className="py-2.5 px-3">Potential Payout</th>
                        <th className="py-2.5 px-3 text-right">Started At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tile-border/50">
                      {stats.activeRounds.map((round) => (
                        <tr key={round.id} className="hover:bg-tile/50 transition-colors font-mono">
                          <td className="py-3 px-3 font-sans font-bold text-text-primary">
                            {round.username}
                          </td>
                          <td className="py-3 px-3 font-bold text-accent-gold">
                            {round.bet.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-text-secondary">
                            {round.boardSize}x{round.boardSize} ({round.mines} 💣)
                          </td>
                          <td className="py-3 px-3 font-bold text-primary">
                            {round.revealedCount} 💎
                          </td>
                          <td className="py-3 px-3 text-primary font-bold">
                            {round.multiplier.toFixed(2)}x
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-400">
                            {round.potentialWin.toFixed(2)} mineCoin
                          </td>
                          <td className="py-3 px-3 text-right text-text-muted text-[11px]">
                            {new Date(round.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-text-muted gap-2">
                  <Bomb className="w-8 h-8 opacity-40" />
                  <p className="text-xs">No active rounds playing at this exact second.</p>
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
    </div>
  )
}

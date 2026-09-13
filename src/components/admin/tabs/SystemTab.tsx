import React from 'react'
import { Server, Percent, ShieldCheck, Database, Cpu, Activity } from 'lucide-react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'

export const SystemTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* 2-column Grid of System Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Backend Deployment Details */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-border-default mb-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Backend Infrastructure
            </h3>
            <Badge variant="success">Operational</Badge>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-text-muted" /> Host Runtime
              </span>
              <span className="font-mono text-primary font-bold">Node.js Express / Cloud Run</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-text-muted" /> Database Host
              </span>
              <span className="font-mono text-text-primary">Aiven Cloud PostgreSQL (Prisma ORM)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-text-muted" /> Keep-Alive Pulse
              </span>
              <span className="font-bold text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                14-Min Automated Health Ping
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Game Mathematics & Provably Fair Engine */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between pb-3 border-b border-border-default mb-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Percent className="w-4 h-4 text-accent-gold" />
              Fairness Engine & Mathematics
            </h3>
            <Badge variant="warning">Verified 99.0% RTP</Badge>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary">Expected RTP</span>
              <span className="font-mono font-bold text-primary">99.00%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary">House Margin</span>
              <span className="font-mono font-bold text-accent-gold">1.00%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary">Supported Casino Games</span>
              <span className="font-mono text-text-primary font-bold">Mines, Slots, Roulette, Blackjack, Coin Flip</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-3 rounded-xl border border-border-default">
              <span className="text-text-secondary flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> PRNG Commitment
              </span>
              <span className="font-mono text-text-primary">HMAC-SHA256 Server Seed Hash</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

import React from 'react'
import { GameLayout } from '../layout/GameLayout'
import { BettingControls } from '../game/BettingControls'
import { Board } from '../game/Board'
import { useAuthStore } from '../../store/authStore'

export const MinesView: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <GameLayout
      icon="💣"
      title="Mines"
      subtitle="Classic Grid Strategy · Pick Safe Diamonds & Cash Out"
      rtp="99.0% RTP"
      isGuest={user.isGuest}
      hotkeyHint="Space: Bet or Cashout"
      accentColor="#18C964"
      controls={<BettingControls />}
      playArea={<Board />}
    />
  )
}

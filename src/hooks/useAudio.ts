import { useState, useEffect, useCallback } from 'react'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function useAudio() {
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem('mines_muted') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('mines_muted', String(muted))
  }, [muted])

  const toggleMute = () => setMuted((prev) => !prev)

  // Safe Diamond chime with pitch increasing per consecutive reveal
  const playDiamond = useCallback(
    (streak: number = 0) => {
      if (muted) return
      try {
        const ctx = getAudioContext()
        const now = ctx.currentTime

        // Musical pentatonic scale base frequencies
        const baseFrequencies = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51]
        const freq = baseFrequencies[streak % baseFrequencies.length] * (1 + Math.floor(streak / baseFrequencies.length) * 0.5)

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.15)

        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.35)
      } catch (_) {}
    },
    [muted]
  )

  // Mine Explosion boom
  const playExplosion = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      // Low frequency rumble
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(120, now)
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5)

      gain.gain.setValueAtTime(0.5, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.5)
    } catch (_) {}
  }, [muted])

  // Cashout success chime
  const playCashout = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime
      const chord = [523.25, 659.25, 783.99, 1046.5] // C Major arpeggio

      chord.forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(f, now + i * 0.08)

        gain.gain.setValueAtTime(0.2, now + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.4)
      })
    } catch (_) {}
  }, [muted])

  // Subtle UI click
  const playClick = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    } catch (_) {}
  }, [muted])

  return {
    muted,
    toggleMute,
    playDiamond,
    playExplosion,
    playCashout,
    playClick,
  }
}

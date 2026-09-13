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

  // Reel spinning rhythmic tick
  const playReelSpin = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.03)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.03)
    } catch (_) {}
  }, [muted])

  // Reel stop thud (escalates pitch with each reel 0..4)
  const playReelStop = useCallback((reelIndex: number = 0) => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      const baseFreq = 140 + reelIndex * 25
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.08)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } catch (_) {}
  }, [muted])

  // Slot win arpeggio / celebration
  const playSlotWin = useCallback((multiplier: number = 1) => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const isBigWin = multiplier >= 10
      const notes = isBigWin
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98] // C E G C E G
        : [587.33, 739.99, 880.0, 1174.66] // D F# A D

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.07)

        gain.gain.setValueAtTime(0.18, now + idx * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.07)
        osc.stop(now + idx * 0.07 + 0.3)
      })
    } catch (_) {}
  }, [muted])

  // Coin flick metallic ring
  const playCoinFlick = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1400, now)
      osc.frequency.exponentialRampToValueAtTime(2800, now + 0.05)
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.3)
    } catch (_) {}
  }, [muted])

  // Coin catch percussive landing
  const playCoinCatch = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.06)

      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.06)
    } catch (_) {}
  }, [muted])

  // Streak win harmonic chime
  const playStreakWin = useCallback((streak: number = 1) => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const baseNotes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]
      const note = baseNotes[(streak - 1) % baseNotes.length]

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note, now)
      osc.frequency.exponentialRampToValueAtTime(note * 1.5, now + 0.1)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)
    } catch (_) {}
  }, [muted])

  // Ceramic chip placement clink
  const playChipPlace = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(2400, now)
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.03)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    } catch (_) {}
  }, [muted])

  // Roulette wheel spinning whir
  const playWheelSpin = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(90, now)
      osc.frequency.linearRampToValueAtTime(45, now + 1.2)

      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 1.2)
    } catch (_) {}
  }, [muted])

  // Roulette ball rattling & settling clack
  const playBallDrop = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(950, now)
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.08)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } catch (_) {}
  }, [muted])

  // Card slide swoosh
  const playCardSlide = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.06)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.06)
    } catch (_) {}
  }, [muted])

  // Card flip snap
  const playCardFlip = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    } catch (_) {}
  }, [muted])

  // Blackjack win fanfare (Vegas arpeggio)
  const playBlackjackWin = useCallback((isNaturalBJ: boolean = false) => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const notes = isNaturalBJ
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51] // C E G C E
        : [440, 554.37, 659.25, 880] // A C# E A

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.07)

        gain.gain.setValueAtTime(0.18, now + idx * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.07)
        osc.stop(now + idx * 0.07 + 0.35)
      })
    } catch (_) {}
  }, [muted])

  // Bust defeat tone
  const playBust = useCallback(() => {
    if (muted) return
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.linearRampToValueAtTime(80, now + 0.3)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.3)
    } catch (_) {}
  }, [muted])

  return {
    muted,
    toggleMute,
    playDiamond,
    playExplosion,
    playCashout,
    playClick,
    playReelSpin,
    playReelStop,
    playSlotWin,
    playCoinFlick,
    playCoinCatch,
    playStreakWin,
    playChipPlace,
    playWheelSpin,
    playBallDrop,
    playCardSlide,
    playCardFlip,
    playBlackjackWin,
    playBust,
  }
}

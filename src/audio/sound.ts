/*
 * All sounds are synthesized with the Web Audio API — no audio assets to
 * download, nothing to precache, and everything works offline.
 * The context is created lazily on the first user gesture (autoplay policy).
 */

export type SoundName = 'tap' | 'tick' | 'thunk' | 'jingle' | 'star' | 'success'

let ctx: AudioContext | null = null
let muted = false

function ensureContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setMuted(value: boolean): void {
  muted = value
}

function tone(
  audio: AudioContext,
  {
    freq,
    type = 'sine',
    at = 0,
    duration = 0.1,
    volume = 0.2,
    glideTo,
  }: {
    freq: number
    type?: OscillatorType
    at?: number
    duration?: number
    volume?: number
    glideTo?: number
  },
): void {
  const t0 = audio.currentTime + at
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

const SOUNDS: Record<SoundName, (audio: AudioContext) => void> = {
  tap: (a) => tone(a, { freq: 660, type: 'triangle', duration: 0.05, volume: 0.12 }),

  tick: (a) => tone(a, { freq: 950, type: 'square', duration: 0.025, volume: 0.05 }),

  thunk: (a) => {
    tone(a, { freq: 180, type: 'triangle', duration: 0.12, volume: 0.3, glideTo: 90 })
    tone(a, { freq: 520, type: 'sine', at: 0.01, duration: 0.06, volume: 0.1 })
  },

  jingle: (a) => {
    // A warm little major arpeggio with a sparkle on top.
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) =>
      tone(a, { freq, type: 'triangle', at: i * 0.09, duration: 0.32, volume: 0.16 }),
    )
    tone(a, { freq: 1568, type: 'sine', at: 0.36, duration: 0.5, volume: 0.08 })
    tone(a, { freq: 2093, type: 'sine', at: 0.45, duration: 0.6, volume: 0.05 })
  },

  star: (a) => {
    // Harp-like gliss for the rare golden drop.
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51]
    scale.forEach((freq, i) =>
      tone(a, { freq, type: 'triangle', at: i * 0.055, duration: 0.4, volume: 0.1 }),
    )
    tone(a, { freq: 2637, type: 'sine', at: 0.5, duration: 0.8, volume: 0.06 })
  },

  success: (a) => {
    tone(a, { freq: 659.25, type: 'triangle', duration: 0.12, volume: 0.15 })
    tone(a, { freq: 987.77, type: 'triangle', at: 0.1, duration: 0.25, volume: 0.15 })
  },
}

export function play(name: SoundName): void {
  if (muted) return
  const audio = ensureContext()
  if (!audio) return
  try {
    SOUNDS[name](audio)
  } catch {
    // Audio is decoration — never let it break the app.
  }
}

/** Warm the context up inside a user gesture so later sounds fire instantly. */
export function unlockAudio(): void {
  ensureContext()
}

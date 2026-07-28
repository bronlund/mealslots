let enabled = true

export function setHapticsEnabled(value: boolean): void {
  enabled = value
}

/** Best-effort vibration: supported on Android, silently ignored on iOS. */
export function vibrate(pattern: number | number[]): void {
  if (!enabled) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Not supported — that's fine.
  }
}

export const haptic = {
  tap: () => vibrate(8),
  land: () => vibrate(25),
  jackpot: () => vibrate([30, 40, 30, 40, 60]),
  star: () => vibrate([20, 30, 20, 30, 20, 30, 90]),
}

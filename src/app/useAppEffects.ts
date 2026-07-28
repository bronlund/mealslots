import { useEffect, useSyncExternalStore } from 'react'
import { useAppStore } from '../data/store'
import { setMuted } from '../audio/sound'
import { setHapticsEnabled } from '../audio/haptics'
import { setLanguage } from '../i18n'

function subscribeToMedia(query: string) {
  return (callback: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
  }
}

export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribeToMedia('(prefers-color-scheme: dark)'),
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMedia('(prefers-reduced-motion: reduce)'),
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
}

/** The single place where settings are projected onto the document and the
 *  audio/haptics modules. */
export function useAppEffects(): { reducedMotion: boolean; theme: 'day' | 'night' } {
  const settings = useAppStore((s) => s.settings)
  const prefersDark = usePrefersDark()
  const prefersReduced = usePrefersReducedMotion()

  const theme: 'day' | 'night' =
    settings.theme === 'system' ? (prefersDark ? 'night' : 'day') : settings.theme

  const reducedMotion =
    settings.reducedMotion === 'system' ? prefersReduced : settings.reducedMotion === 'off'

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.motion = reducedMotion ? 'reduced' : 'full'
    root.lang = settings.language
  }, [theme, reducedMotion, settings.language])

  useEffect(() => {
    setMuted(!settings.soundOn)
    setHapticsEnabled(settings.hapticsOn)
  }, [settings.soundOn, settings.hapticsOn])

  useEffect(() => {
    setLanguage(settings.language)
  }, [settings.language])

  return { reducedMotion, theme }
}

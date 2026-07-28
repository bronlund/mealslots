import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useAppStore } from '../data/store'
import { useUiStore } from './uiStore'
import { useAppEffects } from './useAppEffects'
import { Onboarding } from '../features/firstRun/Onboarding'
import { SlotMachine } from '../features/machine/SlotMachine'
import { CollectionBook } from '../features/collection/CollectionBook'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { PinGate } from '../features/settings/PinGate'
import { Button } from '../components/Button'

export function App() {
  const { reducedMotion } = useAppEffects()
  const onboarded = useAppStore((s) => s.onboarded)

  if (!onboarded) return <Onboarding />
  return <MainApp reducedMotion={reducedMotion} />
}

function MainApp({ reducedMotion }: { reducedMotion: boolean }) {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const recovered = useAppStore((s) => s.recovered)
  const screen = useUiStore((s) => s.screen)
  const setScreen = useUiStore((s) => s.setScreen)
  const settingsUnlocked = useUiStore((s) => s.settingsUnlocked)
  const unlockSettings = useUiStore((s) => s.unlockSettings)
  const [recoveryDismissed, setRecoveryDismissed] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between">
        {screen === 'machine' ? (
          <button
            onClick={() => updateSettings({ soundOn: !settings.soundOn })}
            aria-label={settings.soundOn ? t('nav.mute') : t('nav.unmute')}
            aria-pressed={!settings.soundOn}
            data-testid="mute"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-surface text-xl shadow-panel"
          >
            {settings.soundOn ? '🔊' : '🔇'}
          </button>
        ) : (
          <button
            onClick={() => setScreen('machine')}
            aria-label={t('nav.back')}
            data-testid="back"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-surface text-xl shadow-panel"
          >
            ←
          </button>
        )}
        <div className="flex gap-2">
          {screen === 'machine' && (
            <>
              <button
                onClick={() => setScreen('collection')}
                aria-label={t('nav.collection')}
                data-testid="nav-collection"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-surface text-xl shadow-panel"
              >
                📖
              </button>
              <button
                onClick={() => setScreen('settings')}
                aria-label={t('nav.settings')}
                data-testid="nav-settings"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gold bg-surface text-xl shadow-panel"
              >
                ⚙️
              </button>
            </>
          )}
        </div>
      </header>

      {recovered && !recoveryDismissed && (
        <div
          role="status"
          className="flex items-start justify-between gap-2 rounded-xl border-2 border-gold bg-surface-alt p-3 font-body text-sm text-ink"
        >
          <span>
            <strong className="block">{t('recovery.title')}</strong>
            {t('recovery.body')}
          </span>
          <Button quiet className="min-h-0 border-none px-2 py-0 shadow-none" onClick={() => setRecoveryDismissed(true)}>
            ✕
          </Button>
        </div>
      )}

      <main className="flex-1">
        {screen === 'machine' && <SlotMachine reducedMotion={reducedMotion} />}
        {screen === 'collection' && <CollectionBook />}
        {screen === 'settings' &&
          (settingsUnlocked ? <SettingsScreen /> : <PinGate onUnlock={unlockSettings} />)}
      </main>

      {needRefresh && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border-2 border-gold bg-surface p-3 font-body text-sm text-ink shadow-panel"
        >
          {t('update.available')}
          <Button variant="primary" onClick={() => void updateServiceWorker(true)}>
            {t('update.reload')}
          </Button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../data/store'
import { hashPin, makeSalt, verifyPin } from '../../data/pin'
import { PinPad } from '../../components/PinPad'
import { Panel } from '../../components/Panel'
import { Button } from '../../components/Button'

interface PinGateProps {
  onUnlock: () => void
}

type Mode = 'enter' | 'reset-new' | 'reset-confirm'

export function PinGate({ onUnlock }: PinGateProps) {
  const { t } = useTranslation()
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [mode, setMode] = useState<Mode>('enter')
  const [error, setError] = useState('')
  const [firstPin, setFirstPin] = useState('')

  async function handleEnter(pin: string) {
    if (await verifyPin(pin, settings.pinSalt, settings.pinHash)) {
      onUnlock()
    } else {
      setError(t('pin.wrong'))
    }
  }

  async function handleReset(pin: string) {
    if (mode === 'reset-new') {
      setFirstPin(pin)
      setError('')
      setMode('reset-confirm')
      return
    }
    if (pin !== firstPin) {
      setError(t('pin.mismatch'))
      setMode('reset-new')
      return
    }
    const salt = makeSalt()
    updateSettings({ pinSalt: salt, pinHash: await hashPin(pin, salt) })
    onUnlock()
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <Panel className="flex w-full max-w-sm flex-col items-center gap-4 p-6">
        <h1 className="font-display text-xl font-bold text-gold-deep">{t('pin.title')}</h1>
        {mode === 'enter' ? (
          <>
            <PinPad label={t('pin.enter')} error={error} onSubmit={(pin) => void handleEnter(pin)} />
            <Button
              quiet
              className="border-none text-sm text-ink-soft underline shadow-none"
              onClick={() => {
                setError('')
                setMode('reset-new')
              }}
            >
              {t('pin.forgot')}
            </Button>
          </>
        ) : (
          <>
            <p className="text-center font-body text-sm text-ink-soft">{t('pin.resetHint')}</p>
            <PinPad
              label={mode === 'reset-new' ? t('pin.set') : t('pin.confirm')}
              error={error}
              onSubmit={(pin) => void handleReset(pin)}
            />
          </>
        )}
      </Panel>
    </div>
  )
}

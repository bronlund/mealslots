import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { Language } from '../../data/types'
import { useAppStore } from '../../data/store'
import { hashPin, makeSalt } from '../../data/pin'
import { detectLanguage, setLanguage } from '../../i18n'
import { FoodIconSvg } from '../../icons/foods'
import { Panel } from '../../components/Panel'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { PinPad } from '../../components/PinPad'

type Step = 'language' | 'welcome' | 'pin' | 'foods'

export function Onboarding() {
  const { t } = useTranslation()
  const foods = useAppStore((s) => s.foods)
  const updateFood = useAppStore((s) => s.updateFood)
  const deleteFood = useAppStore((s) => s.deleteFood)
  const setupProfile = useAppStore((s) => s.setupProfile)
  const finishOnboarding = useAppStore((s) => s.finishOnboarding)

  const [step, setStep] = useState<Step>('language')
  const [language, setLanguageChoice] = useState<Language>(() => detectLanguage())
  const [firstPin, setFirstPin] = useState('')
  const [pinError, setPinError] = useState('')

  function chooseLanguage(lang: Language) {
    setLanguageChoice(lang)
    setLanguage(lang)
  }

  async function handlePin(pin: string) {
    if (!firstPin) {
      setFirstPin(pin)
      setPinError('')
      return
    }
    if (pin !== firstPin) {
      setPinError(t('pin.mismatch'))
      setFirstPin('')
      return
    }
    const salt = makeSalt()
    setupProfile(language, await hashPin(pin, salt), salt)
    setStep('foods')
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Panel className="flex flex-col items-center gap-5 p-6">
          {step === 'language' && (
            <>
              <h1 className="font-display text-2xl font-bold text-gold-deep">{t('app.name')}</h1>
              <p className="font-body text-base font-semibold text-ink">{t('onboarding.languageTitle')}</p>
              <div className="flex gap-2">
                <Pill active={language === 'nb'} onClick={() => chooseLanguage('nb')} data-testid="onb-lang-nb">
                  Norsk
                </Pill>
                <Pill active={language === 'en'} onClick={() => chooseLanguage('en')} data-testid="onb-lang-en">
                  English
                </Pill>
              </div>
              <Button variant="primary" className="w-full" onClick={() => setStep('welcome')} data-testid="onb-next">
                {t('onboarding.next')}
              </Button>
            </>
          )}

          {step === 'welcome' && (
            <>
              <h1 className="font-display text-2xl font-bold text-gold-deep">
                {t('onboarding.welcomeTitle')}
              </h1>
              <div className="flex gap-2" aria-hidden="true">
                {['pasta', 'soup', 'tortilla'].map((iconId) => (
                  <span key={iconId} className="h-14 w-14">
                    <FoodIconSvg iconId={iconId} />
                  </span>
                ))}
              </div>
              <p className="text-center font-body text-base text-ink">{t('onboarding.welcomeBody')}</p>
              <p className="text-center font-body text-sm text-ink-soft">🔒 {t('onboarding.privacy')}</p>
              <Button variant="primary" className="w-full" onClick={() => setStep('pin')} data-testid="onb-next">
                {t('onboarding.next')}
              </Button>
            </>
          )}

          {step === 'pin' && (
            <>
              <h1 className="font-display text-xl font-bold text-gold-deep">{t('onboarding.pinTitle')}</h1>
              <p className="text-center font-body text-sm text-ink-soft">{t('onboarding.pinBody')}</p>
              <PinPad
                label={firstPin ? t('pin.confirm') : t('pin.set')}
                error={pinError}
                onSubmit={(pin) => void handlePin(pin)}
              />
            </>
          )}

          {step === 'foods' && (
            <>
              <h1 className="font-display text-xl font-bold text-gold-deep">
                {t('onboarding.foodsTitle')}
              </h1>
              <p className="text-center font-body text-sm text-ink-soft">{t('onboarding.foodsBody')}</p>
              <ul className="flex max-h-72 w-full flex-col gap-1.5 overflow-y-auto">
                {foods.map((food) => (
                  <li
                    key={food.id}
                    className="flex items-center gap-2 rounded-lg border-2 border-gold bg-surface p-1.5"
                  >
                    <span className="h-9 w-9 shrink-0">
                      <FoodIconSvg iconId={food.iconId} />
                    </span>
                    <span className="flex-1 truncate font-body text-sm font-bold text-ink">{food.name}</span>
                    <input
                      type="checkbox"
                      checked={food.enabled}
                      aria-label={food.name}
                      onChange={(e) => updateFood(food.id, { enabled: e.target.checked })}
                      className="h-5 w-5 accent-(--nn-accent)"
                    />
                    <button
                      onClick={() => deleteFood(food.id)}
                      aria-label={`${t('settings.delete')} ${food.name}`}
                      className="px-1.5 font-bold text-danger"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="w-full" onClick={finishOnboarding} data-testid="onb-done">
                {t('onboarding.done')}
              </Button>
            </>
          )}
        </Panel>
      </motion.div>
    </main>
  )
}

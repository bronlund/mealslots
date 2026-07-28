import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { SpinResult } from '../../engine/spin'
import { FoodIconSvg } from '../../icons/foods'
import { Sparkles } from '../../components/Sparkles'
import { Panel } from '../../components/Panel'
import { Button } from '../../components/Button'
import { play } from '../../audio/sound'
import { haptic } from '../../audio/haptics'

interface CelebrationOverlayProps {
  result: Exclude<SpinResult, { kind: 'empty' }> | null
  onEat: () => void
  onAgain: () => void
}

export function CelebrationOverlay({ result, onEat, onAgain }: CelebrationOverlayProps) {
  const { t } = useTranslation()
  const [confirmed, setConfirmed] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const isStar = result?.isStar ?? false
  const foods = result == null ? [] : result.kind === 'single' ? [result.food] : result.foods
  const names = foods.map((f) => f.name).join(t('celebration.comboJoin'))

  useEffect(() => {
    if (result == null) {
      setConfirmed(false)
      return
    }
    if (result.isStar) {
      play('star')
      haptic.star()
    } else {
      play('jingle')
      haptic.jackpot()
    }
    return () => clearTimeout(closeTimer.current)
  }, [result])

  function handleEat() {
    setConfirmed(true)
    play('success')
    closeTimer.current = setTimeout(onEat, 1100)
  }

  return (
    <AnimatePresence>
      {result != null && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Golden light beam sweep for star drops. */}
          {isStar && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.4] }}
              transition={{ duration: 1.2, times: [0, 0.4, 1] }}
              style={{
                background:
                  'radial-gradient(ellipse 70% 55% at 50% 45%, color-mix(in srgb, var(--nn-star) 45%, transparent), transparent)',
              }}
            />
          )}
          <motion.div
            initial={{ scale: 0.6, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            className="relative w-full max-w-sm"
          >
            <Panel
              className={`relative flex flex-col items-center gap-3 p-6 text-center ${
                isStar ? 'border-star shadow-glow' : ''
              }`}
            >
              <Sparkles burstKey={1} golden={isStar} count={isStar ? 20 : 14} />
              <p
                className={`font-display text-2xl font-bold tracking-wide ${
                  isStar ? 'text-gold-deep' : 'text-accent-deep'
                }`}
              >
                {isStar ? `⭐ ${t('celebration.star')}` : t('celebration.jackpot')}
              </p>
              <div className="flex items-center justify-center gap-2">
                {foods.map((food) => (
                  <motion.div
                    key={food.id}
                    className="h-24 w-24"
                    initial={{ rotate: -6 }}
                    animate={{ rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <FoodIconSvg iconId={food.iconId} label={food.name} />
                  </motion.div>
                ))}
              </div>
              <p className="font-display text-3xl font-bold break-words text-ink" data-testid="result-name">
                {names}
              </p>
              {isStar && <p className="font-body text-base text-ink-soft">{t('celebration.starPrompt')}</p>}
              {confirmed ? (
                <motion.p
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-2 font-body text-xl font-bold text-success"
                >
                  {t('celebration.logged')} 🎉
                </motion.p>
              ) : (
                <div className="mt-1 flex w-full gap-3">
                  <Button variant="primary" className="min-h-14 flex-1 text-lg" onClick={handleEat}>
                    {t('celebration.eat')}
                  </Button>
                  <Button className="min-h-14 flex-1" onClick={onAgain}>
                    {t('celebration.again')}
                  </Button>
                </div>
              )}
            </Panel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Food, MealType } from '../../data/types'
import { useAppStore } from '../../data/store'
import { useUiStore } from '../../app/uiStore'
import { eligibleFoods, mealTypeForClock, spin, type SpinResult } from '../../engine/spin'
import { buildReelStrip } from '../../engine/reelStrip'
import { Reel, WINDOW } from './Reel'
import { MealTypePicker } from './MealTypePicker'
import { CelebrationOverlay } from './CelebrationOverlay'
import { Panel } from '../../components/Panel'
import { Button } from '../../components/Button'
import { play, unlockAudio } from '../../audio/sound'
import { haptic } from '../../audio/haptics'

type Phase = 'idle' | 'spinning' | 'result'

interface SlotMachineProps {
  reducedMotion: boolean
}

export function SlotMachine({ reducedMotion }: SlotMachineProps) {
  const { t } = useTranslation()
  const foods = useAppStore((s) => s.foods)
  const confirmMeal = useAppStore((s) => s.confirmMeal)
  const setScreen = useUiStore((s) => s.setScreen)

  const [mealType, setMealType] = useState<MealType>(() => mealTypeForClock(new Date()))
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<SpinResult | null>(null)
  const [strips, setStrips] = useState<Food[][]>([])
  const [skipped, setSkipped] = useState(false)
  const landedCount = useRef(0)
  const tickTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const pool = useMemo(() => eligibleFoods(foods, mealType, { star: false }), [foods, mealType])

  // Idle display: a calm window with a food peeking on each reel.
  const idleStrips = useMemo<Food[][]>(() => {
    if (pool.length === 0) return []
    return [0, 1, 2].map((i) => [pool[i % pool.length]])
  }, [pool])

  useEffect(() => stopTicks, [])

  function stopTicks() {
    clearInterval(tickTimer.current)
    tickTimer.current = undefined
  }

  function doSpin() {
    if (phase === 'spinning') return
    unlockAudio()
    const state = useAppStore.getState()
    const spinResult = spin({
      foods: state.foods,
      log: state.log,
      settings: state.settings,
      mealType,
      now: new Date(),
      rng: state.rng,
    })
    if (spinResult.kind === 'empty') return

    const landing =
      spinResult.kind === 'single'
        ? [spinResult.food, spinResult.food, spinResult.food]
        : spinResult.foods
    // Star foods only appear at the very end of the scroll — the pool that
    // streaks past is the everyday one, which makes the landing the surprise.
    const stripPool = pool.length > 0 ? pool : landing
    setStrips(
      landing.map((food, i) =>
        buildReelStrip(food, stripPool, state.rng, reducedMotion ? 3 : 14 + i * 5),
      ),
    )
    setResult(spinResult)
    setSkipped(false)
    landedCount.current = 0
    setPhase('spinning')
    haptic.tap()
    if (!reducedMotion) {
      stopTicks()
      tickTimer.current = setInterval(() => play('tick'), 95)
    }
  }

  function handleLand() {
    landedCount.current += 1
    play('thunk')
    haptic.land()
    const total = strips.length
    if (landedCount.current >= total) {
      stopTicks()
      setTimeout(() => setPhase('result'), reducedMotion ? 80 : 300)
    }
  }

  function closeOverlay() {
    setPhase('idle')
    setResult(null)
  }

  function handleEat() {
    if (result != null) confirmMeal(result, mealType)
    closeOverlay()
  }

  function handleAgain() {
    closeOverlay()
    // Let the overlay exit before the reels take off again.
    setTimeout(doSpin, 120)
  }

  const durations = reducedMotion ? [0.3, 0.3, 0.3] : [1.55, 2.0, 2.45]
  const spinning = phase === 'spinning'
  const shownStrips = spinning || phase === 'result' ? strips : idleStrips
  const resultFoods =
    result == null || result.kind === 'empty'
      ? []
      : result.kind === 'single'
        ? [result.food]
        : result.foods

  return (
    <div className="flex flex-col items-center gap-5">
      <MealTypePicker value={mealType} onChange={setMealType} disabled={spinning} />

      <Panel className="w-full max-w-sm px-4 pt-5 pb-6">
        <h1 className="mb-4 text-center font-display text-2xl font-bold tracking-wider text-gold-deep">
          {t('app.name')}
        </h1>

        {pool.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-2 py-6 text-center" data-testid="empty-state">
            <p className="font-display text-lg font-bold text-ink">{t('machine.emptyTitle')}</p>
            <p className="font-body text-sm text-ink-soft">{t('machine.emptyBody')}</p>
            <Button onClick={() => setScreen('settings')}>{t('machine.openSettings')}</Button>
          </div>
        ) : (
          <>
            {/* The glass reel window. Tapping it mid-spin skips the animation. */}
            <div
              className="relative mx-auto flex items-center justify-center gap-2 rounded-xl border-2 border-gold bg-glass px-3 py-2 shadow-inner"
              style={{ minHeight: WINDOW + 16 }}
              onPointerDown={() => spinning && setSkipped(true)}
              data-testid="reel-window"
            >
              {shownStrips.map((strip, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <div className="h-20 w-0.5 rounded bg-gold opacity-50" />}
                  <Reel
                    strip={strip}
                    spinning={spinning}
                    duration={durations[i] ?? 2}
                    skipped={skipped}
                    onLand={handleLand}
                  />
                </div>
              ))}
              {/* Payline markers */}
              <span aria-hidden="true" className="absolute top-1/2 -left-1 -translate-y-1/2 text-gold-deep">
                ▶
              </span>
              <span aria-hidden="true" className="absolute top-1/2 -right-1 -translate-y-1/2 text-gold-deep">
                ◀
              </span>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={doSpin}
                disabled={spinning}
                data-testid="spin"
                className="min-h-16 w-52 rounded-2xl border-3 border-gold-deep bg-accent font-display text-2xl font-bold tracking-widest text-[#3a2a10] shadow-glow transition-transform active:translate-y-1 disabled:opacity-60"
                style={{ animation: spinning ? 'none' : 'nn-glow-pulse 3s ease-in-out infinite' }}
              >
                {spinning ? t('machine.spinning') : t('machine.spin')}
              </button>
            </div>
          </>
        )}
      </Panel>

      {/* Screen-reader announcement of the outcome. */}
      <div aria-live="polite" className="sr-only">
        {phase === 'result' && resultFoods.length > 0
          ? t(resultFoods.length > 1 ? 'machine.comboAnnouncement' : 'machine.resultAnnouncement', {
              food: resultFoods[0]?.name,
              foods: resultFoods.map((f) => f.name).join(', '),
            })
          : ''}
      </div>

      <CelebrationOverlay
        result={phase === 'result' && result != null && result.kind !== 'empty' ? result : null}
        onEat={handleEat}
        onAgain={handleAgain}
      />
    </div>
  )
}

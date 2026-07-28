import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../data/store'
import { FoodIconSvg } from '../../icons/foods'
import { Panel } from '../../components/Panel'

/** Eat-count milestones that earn the card its decorative stars. */
const MILESTONES = [1, 5, 15]

function starsFor(count: number): number {
  return MILESTONES.filter((m) => count >= m).length
}

export function CollectionBook() {
  const { t } = useTranslation()
  const foods = useAppStore((s) => s.foods)
  const log = useAppStore((s) => s.log)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const entry of log) {
      for (const id of entry.foodIds) {
        map.set(id, (map.get(id) ?? 0) + 1)
      }
    }
    return map
  }, [log])

  const sorted = useMemo(
    () =>
      [...foods].sort((a, b) => {
        const ca = counts.get(a.id) ?? 0
        const cb = counts.get(b.id) ?? 0
        if (ca !== cb) return cb - ca
        return a.name.localeCompare(b.name)
      }),
    [foods, counts],
  )

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center font-display text-2xl font-bold text-gold-deep">
        {t('collection.title')}
      </h2>
      {sorted.length === 0 || log.length === 0 ? (
        <Panel ornate={false} className="p-6 text-center">
          <p className="font-body text-base text-ink-soft">{t('collection.empty')}</p>
        </Panel>
      ) : null}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" data-testid="collection-grid">
        {sorted.map((food) => {
          const count = counts.get(food.id) ?? 0
          const unlocked = count > 0
          const stars = starsFor(count)
          const countLabel = unlocked
            ? count === 1
              ? t('collection.eatenOnce')
              : t('collection.eatenCount', { count })
            : t('collection.locked')
          return (
            <div
              key={food.id}
              data-testid="collection-card"
              data-unlocked={unlocked}
              className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-2 pt-3 shadow-panel ${
                food.isStar && unlocked
                  ? 'border-star bg-surface-alt'
                  : 'border-gold bg-surface'
              }`}
              aria-label={`${food.name}: ${countLabel}`}
            >
              <div
                className="h-16 w-16"
                style={
                  unlocked
                    ? undefined
                    : { filter: 'grayscale(1) brightness(0.55) contrast(0.55)', opacity: 0.5 }
                }
              >
                <FoodIconSvg iconId={food.iconId} />
              </div>
              <p className="max-w-full truncate font-body text-xs font-bold text-ink">
                {unlocked ? food.name : '???'}
              </p>
              <div className="flex h-4 gap-0.5" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <svg key={i} viewBox="0 0 20 20" width="13" height="13">
                    <path
                      d="M 10 1.5 L 12.6 7.3 L 19 8 L 14.2 12.3 L 15.6 18.5 L 10 15.2 L 4.4 18.5 L 5.8 12.3 L 1 8 L 7.4 7.3 Z"
                      fill={i < stars ? 'var(--nn-star)' : 'transparent'}
                      stroke="var(--nn-gold)"
                      strokeWidth="1.4"
                    />
                  </svg>
                ))}
              </div>
              {unlocked && (
                <span className="font-body text-[10px] text-ink-soft">{countLabel}</span>
              )}
              {food.isStar && (
                <span aria-hidden="true" className="absolute top-1 right-1 text-xs">
                  ⭐
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

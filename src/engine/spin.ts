import type { Food, MealLogEntry, MealType, Settings } from '../data/types'
import { ANTI_REPEAT_FACTOR, COMBO_CATEGORIES, WEIGHT_MULTIPLIER } from '../data/types'
import type { Rng } from './rng'

export type EngineSettings = Pick<
  Settings,
  'slotMode' | 'starDropsEnabled' | 'starChance' | 'antiRepeatHours'
>

export interface SpinContext {
  foods: Food[]
  log: MealLogEntry[]
  settings: EngineSettings
  mealType: MealType
  now: Date
  rng: Rng
}

export type SpinResult =
  /** Single-dish mode: all three reels land on this food. */
  | { kind: 'single'; food: Food; isStar: boolean }
  /** Combo mode: one food per combo category that has an eligible pool. */
  | { kind: 'combo'; foods: Food[]; isStar: boolean }
  /** No enabled foods match the meal type — the UI shows a friendly setup hint. */
  | { kind: 'empty' }

export function eligibleFoods(
  foods: Food[],
  mealType: MealType,
  opts: { star: boolean },
): Food[] {
  return foods.filter(
    (f) => f.enabled && f.isStar === opts.star && f.mealTypes.includes(mealType),
  )
}

/** Weight multiplier after the anti-repeat rule: foods confirmed eaten inside
 *  the window keep a fraction of their odds — reduced, never zero, so a child
 *  who wants yesterday's pasta can still get it. */
export function effectiveWeight(
  food: Food,
  log: MealLogEntry[],
  antiRepeatHours: number,
  now: Date,
): number {
  let weight = WEIGHT_MULTIPLIER[food.weight]
  if (antiRepeatHours > 0) {
    const cutoff = now.getTime() - antiRepeatHours * 3_600_000
    const recentlyEaten = log.some(
      (entry) => entry.foodIds.includes(food.id) && new Date(entry.at).getTime() >= cutoff,
    )
    if (recentlyEaten) weight *= ANTI_REPEAT_FACTOR
  }
  return weight
}

export function weightedDraw(pool: Food[], weights: number[], rng: Rng): Food {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = rng() * total
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll < 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function drawFrom(pool: Food[], ctx: SpinContext): Food {
  const weights = pool.map((f) =>
    effectiveWeight(f, ctx.log, ctx.settings.antiRepeatHours, ctx.now),
  )
  return weightedDraw(pool, weights, ctx.rng)
}

export function spin(ctx: SpinContext): SpinResult {
  const { settings, mealType, foods } = ctx

  // Star drop check happens once per spin, in either mode. A star result is a
  // whole challenge dish and replaces the normal outcome.
  if (settings.starDropsEnabled) {
    const starPool = eligibleFoods(foods, mealType, { star: true })
    if (starPool.length > 0 && ctx.rng() < settings.starChance) {
      const food = starPool[Math.floor(ctx.rng() * starPool.length)]
      return { kind: 'single', food, isStar: true }
    }
  }

  if (settings.slotMode === 'combo') {
    const picks: Food[] = []
    for (const category of COMBO_CATEGORIES) {
      const pool = eligibleFoods(foods, mealType, { star: false }).filter(
        (f) => f.comboCategory === category,
      )
      if (pool.length > 0) picks.push(drawFrom(pool, ctx))
    }
    if (picks.length === 0) return { kind: 'empty' }
    if (picks.length === 1) return { kind: 'single', food: picks[0], isStar: false }
    return { kind: 'combo', foods: picks, isStar: false }
  }

  const pool = eligibleFoods(foods, mealType, { star: false })
  if (pool.length === 0) return { kind: 'empty' }
  return { kind: 'single', food: drawFrom(pool, ctx), isStar: false }
}

/** Default meal type suggested by the clock; the child can always override. */
export function mealTypeForClock(now: Date): MealType {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes < 10 * 60 + 30) return 'breakfast'
  if (minutes < 14 * 60) return 'lunch'
  if (minutes < 20 * 60) return 'dinner'
  return 'snack'
}

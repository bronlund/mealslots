import type { Food, MealLogEntry, MealType, Settings } from '../data/types'
import { ANTI_REPEAT_FACTOR, COMBO_CATEGORIES, WEIGHT_MULTIPLIER } from '../data/types'
import type { Rng } from './rng'

export type EngineSettings = Pick<
  Settings,
  | 'slotMode'
  | 'jackpotThreeOfAKind'
  | 'jackpotCombos'
  | 'starDropsEnabled'
  | 'starChance'
  | 'antiRepeatHours'
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
  /** One landed food per reel: three independent draws in single mode, one
   *  per combo category in combo mode. */
  | { kind: 'spin'; foods: Food[]; isStar: boolean; isJackpot: boolean }
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

/** A jackpot is three of a kind (when enabled) or any parent-defined
 *  combination, matched regardless of reel order. */
export function checkJackpot(
  landed: Food[],
  settings: Pick<EngineSettings, 'jackpotThreeOfAKind' | 'jackpotCombos'>,
): boolean {
  if (landed.length < 2) return false
  if (
    settings.jackpotThreeOfAKind &&
    landed.length === 3 &&
    landed.every((f) => f.id === landed[0].id)
  ) {
    return true
  }
  const key = landed
    .map((f) => f.id)
    .sort()
    .join('|')
  return settings.jackpotCombos.some(
    (combo) => combo.length === landed.length && [...combo].sort().join('|') === key,
  )
}

export function spin(ctx: SpinContext): SpinResult {
  const { settings, mealType, foods } = ctx

  // Star drop check happens once per spin, in either mode. A star drop fills
  // every reel with the challenge food — a guaranteed golden jackpot.
  if (settings.starDropsEnabled) {
    const starPool = eligibleFoods(foods, mealType, { star: true })
    if (starPool.length > 0 && ctx.rng() < settings.starChance) {
      const food = starPool[Math.floor(ctx.rng() * starPool.length)]
      return { kind: 'spin', foods: [food, food, food], isStar: true, isJackpot: true }
    }
  }

  let landed: Food[]
  if (settings.slotMode === 'combo') {
    landed = []
    for (const category of COMBO_CATEGORIES) {
      const pool = eligibleFoods(foods, mealType, { star: false }).filter(
        (f) => f.comboCategory === category,
      )
      if (pool.length > 0) landed.push(drawFrom(pool, ctx))
    }
  } else {
    const pool = eligibleFoods(foods, mealType, { star: false })
    if (pool.length === 0) return { kind: 'empty' }
    // Three independent draws (repeats allowed) — matching reels are possible
    // but never guaranteed, which is what makes a jackpot special.
    landed = [drawFrom(pool, ctx), drawFrom(pool, ctx), drawFrom(pool, ctx)]
  }
  if (landed.length === 0) return { kind: 'empty' }
  return { kind: 'spin', foods: landed, isStar: false, isJackpot: checkJackpot(landed, settings) }
}

/** Default meal type suggested by the clock; the child can always override. */
export function mealTypeForClock(now: Date): MealType {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes < 10 * 60 + 30) return 'breakfast'
  if (minutes < 14 * 60) return 'lunch'
  if (minutes < 20 * 60) return 'dinner'
  return 'snack'
}

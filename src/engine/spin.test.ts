import { describe, expect, it } from 'vitest'
import {
  checkJackpot,
  effectiveWeight,
  mealTypeForClock,
  spin,
  type SpinContext,
} from './spin'
import { buildReelStrip } from './reelStrip'
import { seededRng } from './rng'
import { engineSettings, makeFood, makeLogEntry } from '../test/factories'
import type { Food } from '../data/types'

const NOW = new Date('2026-07-28T17:00:00.000Z')

function ctx(overrides: Partial<SpinContext> = {}): SpinContext {
  return {
    foods: [],
    log: [],
    settings: engineSettings(),
    mealType: 'dinner',
    now: NOW,
    rng: seededRng(1),
    ...overrides,
  }
}

/** Tallies every landed reel across n spins (draws are independent, so each
 *  reel follows the same distribution). */
function drawMany(context: SpinContext, n: number): Map<string, number> {
  const counts = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    const result = spin(context)
    if (result.kind === 'spin') {
      for (const food of result.foods) {
        counts.set(food.name, (counts.get(food.name) ?? 0) + 1)
      }
    }
  }
  return counts
}

describe('spin — pools and filtering', () => {
  it('returns empty when no enabled food matches the meal type', () => {
    const foods = [
      makeFood({ mealTypes: ['breakfast'] }),
      makeFood({ enabled: false }),
      makeFood({ isStar: true }),
    ]
    expect(spin(ctx({ foods }))).toEqual({ kind: 'empty' })
  })

  it('lands three reels, all drawn from the pool', () => {
    const only = makeFood({ name: 'Soup' })
    const result = spin(ctx({ foods: [only] }))
    expect(result.kind).toBe('spin')
    if (result.kind === 'spin') {
      expect(result.foods).toHaveLength(3)
      expect(result.foods.every((f) => f.id === only.id)).toBe(true)
      // A single-food pool is always three of a kind.
      expect(result.isJackpot).toBe(true)
    }
  })

  it('never picks disabled foods or foods from other meal types', () => {
    const foods = [
      makeFood({ name: 'Dinner A' }),
      makeFood({ name: 'Dinner B' }),
      makeFood({ name: 'Off', enabled: false }),
      makeFood({ name: 'Breakfast', mealTypes: ['breakfast'] }),
    ]
    const counts = drawMany(ctx({ foods }), 500)
    expect(counts.has('Off')).toBe(false)
    expect(counts.has('Breakfast')).toBe(false)
    expect((counts.get('Dinner A') ?? 0) + (counts.get('Dinner B') ?? 0)).toBe(1500)
  })

  it('reels are independent — matching trios are possible but not guaranteed', () => {
    const foods = [makeFood({ name: 'A' }), makeFood({ name: 'B' })]
    let jackpots = 0
    const n = 2000
    const context = ctx({ foods })
    for (let i = 0; i < n; i++) {
      const result = spin(context)
      if (result.kind === 'spin' && result.isJackpot) jackpots++
    }
    // Uniform two-food pool: P(three of a kind) = 2 × (1/2)³ = 0.25.
    expect(jackpots / n).toBeGreaterThan(0.18)
    expect(jackpots / n).toBeLessThan(0.32)
  })
})

describe('spin — weighting', () => {
  it('respects less/normal/more weights within statistical tolerance', () => {
    const foods = [
      makeFood({ name: 'Less', weight: 'less' }),
      makeFood({ name: 'Normal', weight: 'normal' }),
      makeFood({ name: 'More', weight: 'more' }),
    ]
    const n = 5_000 // 15 000 draws across three reels
    const counts = drawMany(ctx({ foods, settings: engineSettings({ antiRepeatHours: 0 }) }), n)
    expect(counts.get('Less')! / (3 * n)).toBeCloseTo(0.5 / 3.5, 1)
    expect(counts.get('Normal')! / (3 * n)).toBeCloseTo(1 / 3.5, 1)
    expect(counts.get('More')! / (3 * n)).toBeCloseTo(2 / 3.5, 1)
  })

  it('anti-repeat lowers but never zeroes odds of recently eaten foods', () => {
    const pasta = makeFood({ name: 'Pasta' })
    const rice = makeFood({ name: 'Rice' })
    const log = [makeLogEntry({ foodIds: [pasta.id], at: '2026-07-28T08:00:00.000Z' })]
    expect(effectiveWeight(pasta, log, 36, NOW)).toBeCloseTo(0.25)
    expect(effectiveWeight(rice, log, 36, NOW)).toBe(1)

    const n = 5_000
    const counts = drawMany(ctx({ foods: [pasta, rice], log }), n)
    expect(counts.get('Pasta')! / (3 * n)).toBeCloseTo(0.25 / 1.25, 1)
    expect(counts.get('Pasta')!).toBeGreaterThan(0)
  })

  it('anti-repeat expires outside the window and can be disabled', () => {
    const pasta = makeFood({ name: 'Pasta' })
    const oldEntry = [makeLogEntry({ foodIds: [pasta.id], at: '2026-07-25T08:00:00.000Z' })]
    expect(effectiveWeight(pasta, oldEntry, 36, NOW)).toBe(1)

    const recent = [makeLogEntry({ foodIds: [pasta.id], at: '2026-07-28T08:00:00.000Z' })]
    expect(effectiveWeight(pasta, recent, 0, NOW)).toBe(1)
  })
})

describe('checkJackpot', () => {
  const a = makeFood({ name: 'A' })
  const b = makeFood({ name: 'B' })
  const c = makeFood({ name: 'C' })

  it('three of a kind wins when enabled, not when disabled', () => {
    const settings = { jackpotThreeOfAKind: true, jackpotCombos: [] }
    expect(checkJackpot([a, a, a], settings)).toBe(true)
    expect(checkJackpot([a, a, b], settings)).toBe(false)
    expect(checkJackpot([a, a, a], { ...settings, jackpotThreeOfAKind: false })).toBe(false)
  })

  it('custom combinations match in any reel order', () => {
    const settings = { jackpotThreeOfAKind: false, jackpotCombos: [[a.id, b.id, c.id]] }
    expect(checkJackpot([c, a, b], settings)).toBe(true)
    expect(checkJackpot([a, b, b], settings)).toBe(false)
  })

  it('combinations with repeats need matching multiplicity', () => {
    const settings = { jackpotThreeOfAKind: false, jackpotCombos: [[a.id, a.id, b.id]] }
    expect(checkJackpot([a, b, a], settings)).toBe(true)
    expect(checkJackpot([a, b, b], settings)).toBe(false)
    expect(checkJackpot([a, b, c], settings)).toBe(false)
  })

  it('combo length must match the reel count', () => {
    const settings = { jackpotThreeOfAKind: false, jackpotCombos: [[a.id, b.id, c.id]] }
    expect(checkJackpot([a, b], settings)).toBe(false)
  })
})

describe('spin — star drops', () => {
  function starSetup(): Food[] {
    return [
      makeFood({ name: 'Safe A' }),
      makeFood({ name: 'Safe B' }),
      makeFood({ name: 'Star', isStar: true }),
    ]
  }

  it('never drops stars when disabled', () => {
    const results = drawMany(
      ctx({ foods: starSetup(), settings: engineSettings({ starDropsEnabled: false }) }),
      2000,
    )
    expect(results.has('Star')).toBe(false)
  })

  it('drops stars at roughly the configured probability', () => {
    const n = 10_000
    let stars = 0
    const context = ctx({
      foods: starSetup(),
      settings: engineSettings({ starDropsEnabled: true, starChance: 0.1 }),
    })
    for (let i = 0; i < n; i++) {
      const result = spin(context)
      if (result.kind === 'spin' && result.isStar) stars++
    }
    expect(stars / n).toBeCloseTo(0.1, 1)
  })

  it('a star drop fills every reel and is a golden jackpot', () => {
    const result = spin(
      ctx({
        foods: starSetup(),
        settings: engineSettings({ starDropsEnabled: true, starChance: 1 }),
      }),
    )
    expect(result.kind).toBe('spin')
    if (result.kind === 'spin') {
      expect(result.isStar).toBe(true)
      expect(result.isJackpot).toBe(true)
      expect(result.foods.map((f) => f.name)).toEqual(['Star', 'Star', 'Star'])
    }
  })

  it('falls back to a normal spin when no star food matches the meal type', () => {
    const foods = [
      makeFood({ name: 'Safe' }),
      makeFood({ name: 'Star', isStar: true, mealTypes: ['breakfast'] }),
    ]
    const result = spin(
      ctx({ foods, settings: engineSettings({ starDropsEnabled: true, starChance: 1 }) }),
    )
    expect(result.kind).toBe('spin')
    if (result.kind === 'spin') expect(result.foods[0].name).toBe('Safe')
  })
})

describe('spin — combo mode', () => {
  it('draws one food per category with an eligible pool', () => {
    const foods = [
      makeFood({ name: 'Pasta', comboCategory: 'base' }),
      makeFood({ name: 'Meatballs', comboCategory: 'protein' }),
      makeFood({ name: 'Broccoli', comboCategory: 'extra' }),
      makeFood({ name: 'Uncategorized' }),
    ]
    const result = spin(ctx({ foods, settings: engineSettings({ slotMode: 'combo' }) }))
    expect(result.kind).toBe('spin')
    if (result.kind === 'spin') {
      expect(result.foods.map((f) => f.name)).toEqual(['Pasta', 'Meatballs', 'Broccoli'])
      expect(result.isJackpot).toBe(false)
    }
  })

  it('a custom combination can make a combo spin a jackpot', () => {
    const pasta = makeFood({ name: 'Pasta', comboCategory: 'base' })
    const meatballs = makeFood({ name: 'Meatballs', comboCategory: 'protein' })
    const broccoli = makeFood({ name: 'Broccoli', comboCategory: 'extra' })
    const result = spin(
      ctx({
        foods: [pasta, meatballs, broccoli],
        settings: engineSettings({
          slotMode: 'combo',
          jackpotCombos: [[broccoli.id, pasta.id, meatballs.id]],
        }),
      }),
    )
    expect(result).toMatchObject({ kind: 'spin', isJackpot: true })
  })

  it('skips empty categories and returns empty when nothing is categorized', () => {
    const solo = makeFood({ name: 'Pasta', comboCategory: 'base' })
    const result = spin(ctx({ foods: [solo], settings: engineSettings({ slotMode: 'combo' }) }))
    expect(result.kind).toBe('spin')
    if (result.kind === 'spin') expect(result.foods).toHaveLength(1)

    const loose = makeFood({ name: 'Loose' })
    expect(spin(ctx({ foods: [loose], settings: engineSettings({ slotMode: 'combo' }) }))).toEqual(
      { kind: 'empty' },
    )
  })
})

describe('buildReelStrip', () => {
  it('always ends on the result and has the requested length', () => {
    const foods = [makeFood({ name: 'A' }), makeFood({ name: 'B' }), makeFood({ name: 'C' })]
    const strip = buildReelStrip(foods[0], foods, seededRng(7), 18)
    expect(strip).toHaveLength(18)
    expect(strip[strip.length - 1]).toBe(foods[0])
    expect(strip[strip.length - 2].id).not.toBe(foods[0].id)
  })

  it('handles a single-food pool', () => {
    const only = makeFood({ name: 'Solo' })
    const strip = buildReelStrip(only, [only], seededRng(7), 10)
    expect(strip).toHaveLength(10)
    expect(strip.every((f) => f.id === only.id)).toBe(true)
  })
})

describe('mealTypeForClock', () => {
  it('maps the day into breakfast/lunch/dinner/snack', () => {
    expect(mealTypeForClock(new Date('2026-07-28T08:00:00'))).toBe('breakfast')
    expect(mealTypeForClock(new Date('2026-07-28T10:29:00'))).toBe('breakfast')
    expect(mealTypeForClock(new Date('2026-07-28T10:30:00'))).toBe('lunch')
    expect(mealTypeForClock(new Date('2026-07-28T13:59:00'))).toBe('lunch')
    expect(mealTypeForClock(new Date('2026-07-28T14:00:00'))).toBe('dinner')
    expect(mealTypeForClock(new Date('2026-07-28T19:59:00'))).toBe('dinner')
    expect(mealTypeForClock(new Date('2026-07-28T20:00:00'))).toBe('snack')
    expect(mealTypeForClock(new Date('2026-07-28T23:30:00'))).toBe('snack')
  })
})

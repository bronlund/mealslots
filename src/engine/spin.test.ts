import { describe, expect, it } from 'vitest'
import { effectiveWeight, mealTypeForClock, spin, type SpinContext } from './spin'
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

function drawMany(context: SpinContext, n: number): Map<string, number> {
  const counts = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    const result = spin(context)
    if (result.kind === 'single') {
      counts.set(result.food.name, (counts.get(result.food.name) ?? 0) + 1)
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

  it('a single-food pool always wins', () => {
    const only = makeFood({ name: 'Soup' })
    const result = spin(ctx({ foods: [only] }))
    expect(result).toEqual({ kind: 'single', food: only, isStar: false })
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
    expect((counts.get('Dinner A') ?? 0) + (counts.get('Dinner B') ?? 0)).toBe(500)
  })
})

describe('spin — weighting', () => {
  it('respects less/normal/more weights within statistical tolerance', () => {
    const foods = [
      makeFood({ name: 'Less', weight: 'less' }),
      makeFood({ name: 'Normal', weight: 'normal' }),
      makeFood({ name: 'More', weight: 'more' }),
    ]
    const n = 10_000
    const counts = drawMany(ctx({ foods, settings: engineSettings({ antiRepeatHours: 0 }) }), n)
    // Expected proportions: 0.5/3.5, 1/3.5, 2/3.5
    expect(counts.get('Less')! / n).toBeCloseTo(0.5 / 3.5, 1)
    expect(counts.get('Normal')! / n).toBeCloseTo(1 / 3.5, 1)
    expect(counts.get('More')! / n).toBeCloseTo(2 / 3.5, 1)
  })

  it('anti-repeat lowers but never zeroes odds of recently eaten foods', () => {
    const pasta = makeFood({ name: 'Pasta' })
    const rice = makeFood({ name: 'Rice' })
    const log = [makeLogEntry({ foodIds: [pasta.id], at: '2026-07-28T08:00:00.000Z' })]
    expect(effectiveWeight(pasta, log, 36, NOW)).toBeCloseTo(0.25)
    expect(effectiveWeight(rice, log, 36, NOW)).toBe(1)

    const n = 10_000
    const counts = drawMany(ctx({ foods: [pasta, rice], log }), n)
    expect(counts.get('Pasta')! / n).toBeCloseTo(0.25 / 1.25, 1)
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
    const counts = drawMany(
      ctx({
        foods: starSetup(),
        settings: engineSettings({ starDropsEnabled: true, starChance: 0.1 }),
      }),
      n,
    )
    expect(counts.get('Star')! / n).toBeCloseTo(0.1, 1)
  })

  it('star results carry the isStar flag', () => {
    const context = ctx({
      foods: starSetup(),
      settings: engineSettings({ starDropsEnabled: true, starChance: 1 }),
    })
    const result = spin(context)
    expect(result.kind).toBe('single')
    if (result.kind === 'single') {
      expect(result.isStar).toBe(true)
      expect(result.food.name).toBe('Star')
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
    expect(result.kind).toBe('single')
    if (result.kind === 'single') expect(result.food.name).toBe('Safe')
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
    expect(result.kind).toBe('combo')
    if (result.kind === 'combo') {
      expect(result.foods.map((f) => f.name)).toEqual(['Pasta', 'Meatballs', 'Broccoli'])
    }
  })

  it('skips empty categories and degrades to single with only one pool', () => {
    const foods = [makeFood({ name: 'Pasta', comboCategory: 'base' })]
    const result = spin(ctx({ foods, settings: engineSettings({ slotMode: 'combo' }) }))
    expect(result).toMatchObject({ kind: 'single', food: { name: 'Pasta' } })
  })

  it('returns empty in combo mode when nothing is categorized', () => {
    const foods = [makeFood({ name: 'Loose' })]
    expect(spin(ctx({ foods, settings: engineSettings({ slotMode: 'combo' }) }))).toEqual({
      kind: 'empty',
    })
  })
})

describe('buildReelStrip', () => {
  it('always ends on the result and has the requested length', () => {
    const foods = [makeFood({ name: 'A' }), makeFood({ name: 'B' }), makeFood({ name: 'C' })]
    const strip = buildReelStrip(foods[0], foods, seededRng(7), 18)
    expect(strip).toHaveLength(18)
    expect(strip[strip.length - 1]).toBe(foods[0])
    // The result should not appear immediately before itself at the end.
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

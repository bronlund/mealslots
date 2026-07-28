import type { Food, MealLogEntry, MealType } from '../data/types'
import { newId } from '../data/types'
import type { EngineSettings } from '../engine/spin'

export function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: newId(),
    name: 'Pasta',
    iconId: 'pasta',
    enabled: true,
    weight: 'normal',
    isStar: false,
    mealTypes: ['dinner'] as MealType[],
    createdAt: '2026-07-01T12:00:00.000Z',
    ...overrides,
  }
}

export function makeLogEntry(overrides: Partial<MealLogEntry> = {}): MealLogEntry {
  return {
    id: newId(),
    at: '2026-07-27T17:00:00.000Z',
    mealType: 'dinner',
    foodIds: [],
    wasStar: false,
    ...overrides,
  }
}

export function engineSettings(overrides: Partial<EngineSettings> = {}): EngineSettings {
  return {
    slotMode: 'single',
    jackpotThreeOfAKind: true,
    jackpotCombos: [],
    starDropsEnabled: false,
    starChance: 0.05,
    antiRepeatHours: 36,
    ...overrides,
  }
}

import { create } from 'zustand'
import type { Food, Language, MealLogEntry, MealType, PersistedState, Settings } from './types'
import { newId } from './types'
import { loadState, saveState } from './storage'
import { buildSeedFoods } from './seed'
import type { SpinResult } from '../engine/spin'
import { cryptoRng, seededRng, type Rng } from '../engine/rng'

/** Deterministic RNG hook for the E2E suite: `?testSeed=42` in the URL makes
 *  every spin reproducible. Harmless in normal use and documented in README. */
function pickRng(): Rng {
  try {
    const param = new URLSearchParams(window.location.search).get('testSeed')
    if (param !== null && param !== '' && Number.isFinite(Number(param))) {
      return seededRng(Number(param))
    }
  } catch {
    // Non-browser context (unit tests construct their own engine contexts).
  }
  return cryptoRng
}

export interface AppStore extends PersistedState {
  recovered: boolean
  rng: Rng
  /** Onboarding: store language + PIN and seed the starter foods. The foods
   *  prune step follows, so `onboarded` flips separately in finishOnboarding. */
  setupProfile: (language: Language, pinHash: string, pinSalt: string) => void
  finishOnboarding: () => void
  confirmMeal: (result: SpinResult, mealType: MealType) => void
  addFood: (food: Omit<Food, 'id' | 'createdAt'>) => void
  updateFood: (id: string, patch: Partial<Omit<Food, 'id' | 'createdAt'>>) => void
  deleteFood: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  clearHistory: () => void
  replaceState: (state: PersistedState) => void
}

const { state: initial, recovered } = loadState()

export const useAppStore = create<AppStore>((set) => ({
  ...initial,
  recovered,
  rng: pickRng(),

  setupProfile: (language, pinHash, pinSalt) =>
    set((s) => ({
      foods: s.foods.length > 0 ? s.foods : buildSeedFoods(language, new Date()),
      settings: { ...s.settings, language, pinHash, pinSalt },
    })),

  finishOnboarding: () => set({ onboarded: true }),

  confirmMeal: (result, mealType) =>
    set((s) => {
      if (result.kind === 'empty') return s
      const foodIds = result.kind === 'single' ? [result.food.id] : result.foods.map((f) => f.id)
      const entry: MealLogEntry = {
        id: newId(),
        at: new Date().toISOString(),
        mealType,
        foodIds,
        wasStar: result.isStar,
      }
      return { log: [entry, ...s.log] }
    }),

  addFood: (food) =>
    set((s) => ({
      foods: [...s.foods, { ...food, id: newId(), createdAt: new Date().toISOString() }],
    })),

  updateFood: (id, patch) =>
    set((s) => ({
      foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    })),

  deleteFood: (id) =>
    set((s) => ({ foods: s.foods.filter((f) => f.id !== id) })),

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  clearHistory: () => set({ log: [] }),

  replaceState: (state) => set({ ...state }),
}))

// Debounced persistence: any data change lands in localStorage shortly after.
let saveTimer: ReturnType<typeof setTimeout> | undefined
useAppStore.subscribe((s) => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const { schemaVersion, onboarded, foods, log, settings } = s
    try {
      saveState({ schemaVersion, onboarded, foods, log, settings })
    } catch {
      // Storage full or unavailable — the app keeps working from memory.
    }
  }, 250)
})

export function persistNow(): void {
  clearTimeout(saveTimer)
  const { schemaVersion, onboarded, foods, log, settings } = useAppStore.getState()
  saveState({ schemaVersion, onboarded, foods, log, settings })
}

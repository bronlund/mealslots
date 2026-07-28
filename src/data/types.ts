export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type SlotMode = 'single' | 'combo'
export type ComboCategory = 'base' | 'protein' | 'extra'
export type Weight = 'less' | 'normal' | 'more'
export type Language = 'nb' | 'en'
export type ThemeChoice = 'system' | 'day' | 'night'
export type MotionChoice = 'system' | 'on' | 'off'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
export const COMBO_CATEGORIES: ComboCategory[] = ['base', 'protein', 'extra']

export const WEIGHT_MULTIPLIER: Record<Weight, number> = {
  less: 0.5,
  normal: 1,
  more: 2,
}

/** Foods eaten within the anti-repeat window keep this fraction of their odds. */
export const ANTI_REPEAT_FACTOR = 0.25

export interface Food {
  id: string
  name: string
  iconId: string
  enabled: boolean
  weight: Weight
  /** Challenge food: only appears as a rare golden drop, never in the normal pool. */
  isStar: boolean
  mealTypes: MealType[]
  comboCategory?: ComboCategory
  createdAt: string
}

export interface MealLogEntry {
  id: string
  /** ISO timestamp of the "Let's eat!" confirmation. */
  at: string
  mealType: MealType
  /** One food in single mode, up to three in combo mode. */
  foodIds: string[]
  wasStar: boolean
}

export interface Settings {
  slotMode: SlotMode
  /** Three matching foods on the payline is a jackpot. */
  jackpotThreeOfAKind: boolean
  /** Parent-defined food trios (by id) that count as a jackpot in any order. */
  jackpotCombos: string[][]
  starDropsEnabled: boolean
  /** Probability that a spin is a star drop, 0.01–0.15. */
  starChance: number
  antiRepeatHours: 0 | 24 | 36 | 48
  language: Language
  theme: ThemeChoice
  soundOn: boolean
  hapticsOn: boolean
  reducedMotion: MotionChoice
  /** SHA-256 of pin + salt; empty until first-run setup completes. */
  pinHash: string
  pinSalt: string
}

export interface PersistedState {
  schemaVersion: number
  onboarded: boolean
  foods: Food[]
  log: MealLogEntry[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  slotMode: 'single',
  jackpotThreeOfAKind: true,
  jackpotCombos: [],
  starDropsEnabled: false,
  starChance: 0.05,
  antiRepeatHours: 36,
  language: 'nb',
  theme: 'system',
  soundOn: true,
  hapticsOn: true,
  reducedMotion: 'system',
  pinHash: '',
  pinSalt: '',
}

export function newId(): string {
  return crypto.randomUUID()
}

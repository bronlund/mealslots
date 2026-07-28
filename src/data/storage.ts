import type { PersistedState } from './types'
import { DEFAULT_SETTINGS } from './types'

export const STORAGE_KEY = 'nomnom-gacha'
export const BACKUP_KEY = 'nomnom-gacha.backup'
export const SCHEMA_VERSION = 1

type Migration = (state: Record<string, unknown>) => Record<string, unknown>

/** Forward-only migrations, keyed by the version they migrate FROM. */
const MIGRATIONS: Record<number, Migration> = {
  // 0 → 1: the pre-release shape had no schemaVersion; normalize it.
  0: (state) => ({ ...state, schemaVersion: 1 }),
}

export function emptyState(): PersistedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    onboarded: false,
    foods: [],
    log: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

function isShapeValid(state: unknown): state is PersistedState {
  if (typeof state !== 'object' || state === null) return false
  const s = state as Record<string, unknown>
  return (
    Array.isArray(s.foods) &&
    Array.isArray(s.log) &&
    typeof s.settings === 'object' &&
    s.settings !== null
  )
}

export function migrate(raw: Record<string, unknown>): PersistedState {
  let state = raw
  let version = typeof state.schemaVersion === 'number' ? state.schemaVersion : 0
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version]
    if (!step) break
    state = step(state)
    version = state.schemaVersion as number
  }
  if (!isShapeValid(state)) throw new Error('invalid persisted state shape')
  // Settings gain new keys over time; defaults fill any gaps.
  return {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS, ...state.settings },
  }
}

export interface LoadResult {
  state: PersistedState
  /** True when stored data was corrupt and a fresh state was issued. The old
   *  payload is preserved under BACKUP_KEY for manual rescue. */
  recovered: boolean
}

export function loadState(storage: Storage = localStorage): LoadResult {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return { state: emptyState(), recovered: false }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return { state: migrate(parsed), recovered: false }
  } catch {
    try {
      storage.setItem(BACKUP_KEY, raw)
    } catch {
      // Backup is best-effort; a full disk must not block recovery.
    }
    return { state: emptyState(), recovered: true }
  }
}

export function saveState(state: PersistedState, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

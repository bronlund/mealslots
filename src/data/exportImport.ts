import type { PersistedState } from './types'
import { migrate } from './storage'

export interface ExportFile {
  app: 'nomnom-gacha'
  exportedAt: string
  schemaVersion: number
  onboarded: boolean
  foods: PersistedState['foods']
  log: PersistedState['log']
  settings: Omit<PersistedState['settings'], 'pinHash' | 'pinSalt'>
}

/** Serializes everything except the PIN — a backup must not carry the lock. */
export function exportState(state: PersistedState, now: Date): string {
  const { pinHash: _pinHash, pinSalt: _pinSalt, ...settings } = state.settings
  const file: ExportFile = {
    app: 'nomnom-gacha',
    exportedAt: now.toISOString(),
    schemaVersion: state.schemaVersion,
    onboarded: state.onboarded,
    foods: state.foods,
    log: state.log,
    settings,
  }
  return JSON.stringify(file, null, 2)
}

export interface ImportPreview {
  foods: number
  logEntries: number
  exportedAt: string
  state: PersistedState
}

/** Parses and validates an export file. Throws with a readable message on
 *  anything that is not a Nom Nom Gacha export. The importing device keeps
 *  its own PIN. */
export function parseImport(json: string, current: PersistedState): ImportPreview {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('not-json')
  }
  if (typeof raw !== 'object' || raw === null || (raw as ExportFile).app !== 'nomnom-gacha') {
    throw new Error('not-nomnom')
  }
  const file = raw as ExportFile
  const state = migrate({
    schemaVersion: file.schemaVersion,
    onboarded: file.onboarded ?? true,
    foods: file.foods,
    log: file.log,
    settings: {
      ...file.settings,
      pinHash: current.settings.pinHash,
      pinSalt: current.settings.pinSalt,
    },
  })
  return {
    foods: state.foods.length,
    logEntries: state.log.length,
    exportedAt: file.exportedAt ?? '',
    state,
  }
}

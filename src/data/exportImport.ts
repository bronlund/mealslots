import type { Food, PersistedState, Settings } from './types'
import { migrate } from './storage'

/** The part of the settings that defines a shareable machine setup — no
 *  device-personal preferences (language, theme, sound…), no PIN. */
export const MACHINE_SETTING_KEYS = [
  'slotMode',
  'jackpotThreeOfAKind',
  'jackpotCombos',
  'starDropsEnabled',
  'starChance',
  'antiRepeatHours',
] as const

export type MachineSettings = Pick<Settings, (typeof MACHINE_SETTING_KEYS)[number]>

export interface BackupFile {
  app: 'nomnom-gacha'
  kind?: 'backup'
  exportedAt: string
  schemaVersion: number
  onboarded: boolean
  foods: PersistedState['foods']
  log: PersistedState['log']
  settings: Omit<PersistedState['settings'], 'pinHash' | 'pinSalt'>
}

export interface SetupFile {
  app: 'nomnom-gacha'
  kind: 'setup'
  exportedAt: string
  schemaVersion: number
  foods: Food[]
  machine: MachineSettings
}

function pickMachineSettings(settings: Settings): MachineSettings {
  return {
    slotMode: settings.slotMode,
    jackpotThreeOfAKind: settings.jackpotThreeOfAKind,
    jackpotCombos: settings.jackpotCombos,
    starDropsEnabled: settings.starDropsEnabled,
    starChance: settings.starChance,
    antiRepeatHours: settings.antiRepeatHours,
  }
}

/** Full-device backup: everything except the PIN. */
export function exportState(state: PersistedState, now: Date): string {
  const { pinHash: _pinHash, pinSalt: _pinSalt, ...settings } = state.settings
  const file: BackupFile = {
    app: 'nomnom-gacha',
    kind: 'backup',
    exportedAt: now.toISOString(),
    schemaVersion: state.schemaVersion,
    onboarded: state.onboarded,
    foods: state.foods,
    log: state.log,
    settings,
  }
  return JSON.stringify(file, null, 2)
}

/** Shareable setup: the food list and machine settings only — no meal
 *  history, no PIN, no device-personal preferences. */
export function exportSetup(state: PersistedState, now: Date): string {
  const file: SetupFile = {
    app: 'nomnom-gacha',
    kind: 'setup',
    exportedAt: now.toISOString(),
    schemaVersion: state.schemaVersion,
    foods: state.foods,
    machine: pickMachineSettings(state.settings),
  }
  return JSON.stringify(file, null, 2)
}

export type ImportPreview =
  | {
      kind: 'backup'
      foods: number
      logEntries: number
      exportedAt: string
      state: PersistedState
    }
  | {
      kind: 'setup'
      foods: number
      combos: number
      exportedAt: string
      state: PersistedState
    }

/** Parses either file kind, validating and building the state an import
 *  would apply. Throws readable errors for anything else.
 *  - backup: replaces everything; the importing device keeps its own PIN.
 *  - setup: replaces foods + machine settings; history, app preferences,
 *    and the PIN on this device are kept. */
export function parseImport(json: string, current: PersistedState): ImportPreview {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('not-json')
  }
  if (typeof raw !== 'object' || raw === null || (raw as BackupFile).app !== 'nomnom-gacha') {
    throw new Error('not-nomnom')
  }

  if ((raw as SetupFile).kind === 'setup') {
    const file = raw as SetupFile
    if (!Array.isArray(file.foods) || typeof file.machine !== 'object' || file.machine === null) {
      throw new Error('not-nomnom')
    }
    const machine: Partial<MachineSettings> = {}
    for (const key of MACHINE_SETTING_KEYS) {
      if (key in file.machine) {
        Object.assign(machine, { [key]: file.machine[key] })
      }
    }
    const foodIds = new Set(file.foods.map((f) => f.id))
    const state = migrate({
      schemaVersion: file.schemaVersion,
      onboarded: current.onboarded,
      foods: file.foods,
      log: current.log,
      settings: {
        ...current.settings,
        ...machine,
        // Combinations referencing foods missing from the file can never land.
        jackpotCombos: (machine.jackpotCombos ?? []).filter((combo) =>
          combo.every((id) => foodIds.has(id)),
        ),
      },
    })
    return {
      kind: 'setup',
      foods: state.foods.length,
      combos: state.settings.jackpotCombos.length,
      exportedAt: file.exportedAt ?? '',
      state,
    }
  }

  const file = raw as BackupFile
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
    kind: 'backup',
    foods: state.foods.length,
    logEntries: state.log.length,
    exportedAt: file.exportedAt ?? '',
    state,
  }
}

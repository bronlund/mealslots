import { beforeEach, describe, expect, it } from 'vitest'
import { BACKUP_KEY, STORAGE_KEY, emptyState, loadState, migrate, saveState } from './storage'
import { exportSetup, exportState, parseImport } from './exportImport'
import { hashPin, makeSalt, verifyPin } from './pin'
import { buildSeedFoods } from './seed'
import { DEFAULT_SETTINGS } from './types'

const NOW = new Date('2026-07-28T17:00:00.000Z')

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('returns a fresh state on first run', () => {
    const { state, recovered } = loadState()
    expect(recovered).toBe(false)
    expect(state.onboarded).toBe(false)
    expect(state.foods).toEqual([])
    expect(state.settings).toEqual(DEFAULT_SETTINGS)
  })

  it('round-trips state through save and load', () => {
    const state = emptyState()
    state.onboarded = true
    state.foods = buildSeedFoods('nb', NOW)
    saveState(state)
    const { state: loaded, recovered } = loadState()
    expect(recovered).toBe(false)
    expect(loaded.foods).toHaveLength(15)
    expect(loaded.foods[0].name).toBe('Pasta')
  })

  it('migrates version-0 payloads and fills missing settings keys', () => {
    const legacy = {
      foods: [],
      log: [],
      settings: { language: 'en' },
    }
    const migrated = migrate(legacy)
    expect(migrated.schemaVersion).toBe(1)
    expect(migrated.settings.language).toBe('en')
    expect(migrated.settings.starChance).toBe(DEFAULT_SETTINGS.starChance)
  })

  it('recovers from corrupt JSON, preserving the payload as a backup', () => {
    localStorage.setItem(STORAGE_KEY, '{definitely not json')
    const { state, recovered } = loadState()
    expect(recovered).toBe(true)
    expect(state.onboarded).toBe(false)
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{definitely not json')
  })

  it('seeding is idempotent per language and localizes names', () => {
    const nb = buildSeedFoods('nb', NOW)
    const en = buildSeedFoods('en', NOW)
    expect(nb).toHaveLength(en.length)
    expect(nb.find((f) => f.iconId === 'porridge')!.name).toBe('Grøt')
    expect(en.find((f) => f.iconId === 'porridge')!.name).toBe('Porridge')
  })
})

describe('export / import', () => {
  it('round-trips through export → wipe → import, keeping the local PIN', async () => {
    const state = emptyState()
    state.onboarded = true
    state.foods = buildSeedFoods('nb', NOW)
    state.settings.pinSalt = makeSalt()
    state.settings.pinHash = await hashPin('1234', state.settings.pinSalt)
    const json = exportState(state, NOW)
    expect(json).not.toContain(state.settings.pinHash)

    const fresh = emptyState()
    fresh.settings.pinSalt = makeSalt()
    fresh.settings.pinHash = await hashPin('9999', fresh.settings.pinSalt)
    const preview = parseImport(json, fresh)
    expect(preview.foods).toBe(15)
    expect(preview.state.settings.pinHash).toBe(fresh.settings.pinHash)
    expect(preview.state.foods.map((f) => f.name)).toEqual(state.foods.map((f) => f.name))
  })

  it('rejects non-JSON and foreign files with readable errors', () => {
    expect(() => parseImport('hello', emptyState())).toThrow('not-json')
    expect(() => parseImport('{"app":"other"}', emptyState())).toThrow('not-nomnom')
    expect(() => parseImport('{"app":"nomnom-gacha","kind":"setup"}', emptyState())).toThrow(
      'not-nomnom',
    )
  })
})

describe('setup sharing', () => {
  function makeSharedState() {
    const state = emptyState()
    state.onboarded = true
    state.foods = buildSeedFoods('nb', NOW)
    state.settings.slotMode = 'combo'
    state.settings.starDropsEnabled = true
    state.settings.starChance = 0.12
    state.settings.jackpotThreeOfAKind = false
    state.settings.jackpotCombos = [
      [state.foods[0].id, state.foods[1].id, state.foods[2].id],
    ]
    state.settings.language = 'nb'
    state.settings.theme = 'night'
    state.log = [
      {
        id: 'e1',
        at: NOW.toISOString(),
        mealType: 'dinner',
        foodIds: [state.foods[0].id],
        wasStar: false,
      },
    ]
    return state
  }

  it('exports foods and machine settings only — no history, PIN, or app prefs', () => {
    const state = makeSharedState()
    state.settings.pinHash = 'sekrit-hash'
    const json = exportSetup(state, NOW)
    const parsed = JSON.parse(json)
    expect(parsed.kind).toBe('setup')
    expect(parsed.foods).toHaveLength(15)
    expect(parsed.machine.slotMode).toBe('combo')
    expect(parsed.machine.jackpotCombos).toHaveLength(1)
    expect(parsed.log).toBeUndefined()
    expect(json).not.toContain('sekrit-hash')
    expect(json).not.toContain('"language"')
    expect(json).not.toContain('"theme"')
  })

  it('importing a setup replaces foods + machine settings, keeps everything local', () => {
    const source = makeSharedState()
    const json = exportSetup(source, NOW)

    const receiver = emptyState()
    receiver.onboarded = true
    receiver.settings.language = 'en'
    receiver.settings.theme = 'day'
    receiver.settings.pinHash = 'local-pin'
    receiver.settings.pinSalt = 'local-salt'
    receiver.log = [
      { id: 'mine', at: NOW.toISOString(), mealType: 'lunch', foodIds: ['x'], wasStar: false },
    ]

    const preview = parseImport(json, receiver)
    expect(preview.kind).toBe('setup')
    if (preview.kind === 'setup') {
      expect(preview.foods).toBe(15)
      expect(preview.combos).toBe(1)
    }
    const state = preview.state
    // Shared machine setup applied…
    expect(state.foods.map((f) => f.name)).toEqual(source.foods.map((f) => f.name))
    expect(state.settings.slotMode).toBe('combo')
    expect(state.settings.starChance).toBe(0.12)
    expect(state.settings.jackpotThreeOfAKind).toBe(false)
    // …while everything personal stays local.
    expect(state.log).toHaveLength(1)
    expect(state.log[0].id).toBe('mine')
    expect(state.settings.language).toBe('en')
    expect(state.settings.theme).toBe('day')
    expect(state.settings.pinHash).toBe('local-pin')
    expect(state.onboarded).toBe(true)
  })

  it('prunes jackpot combos referencing foods missing from the setup file', () => {
    const source = makeSharedState()
    const json = exportSetup(source, NOW)
    const tampered = JSON.parse(json)
    tampered.machine.jackpotCombos.push(['ghost-1', 'ghost-2', 'ghost-3'])
    const preview = parseImport(JSON.stringify(tampered), emptyState())
    if (preview.kind === 'setup') {
      expect(preview.combos).toBe(1)
    }
    expect(preview.state.settings.jackpotCombos).toHaveLength(1)
  })
})

describe('pin', () => {
  it('hashes with salt and verifies', async () => {
    const salt = makeSalt()
    const hash = await hashPin('4321', salt)
    expect(hash).toHaveLength(64)
    expect(await verifyPin('4321', salt, hash)).toBe(true)
    expect(await verifyPin('4322', salt, hash)).toBe(false)
    expect(await hashPin('4321', makeSalt())).not.toBe(hash)
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { BACKUP_KEY, STORAGE_KEY, emptyState, loadState, migrate, saveState } from './storage'
import { exportState, parseImport } from './exportImport'
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

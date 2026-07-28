import { describe, expect, it } from 'vitest'
import {
  QR_PREFIX_PLAIN,
  decodeSetupPayload,
  encodeSetupPayload,
  looksLikeSetupPayload,
} from './qr'
import { exportSetup, parseImport } from './exportImport'
import { emptyState } from './storage'
import { buildSeedFoods } from './seed'

const NOW = new Date('2026-07-28T17:00:00.000Z')

describe('QR payload codec', () => {
  it('round-trips a full setup, compressed small enough for one QR code', async () => {
    const state = emptyState()
    state.foods = buildSeedFoods('nb', NOW)
    state.settings.jackpotCombos = [
      [state.foods[0].id, state.foods[1].id, state.foods[2].id],
      [state.foods[3].id, state.foods[3].id, state.foods[4].id],
    ]
    const json = exportSetup(state, NOW)

    const payload = await encodeSetupPayload(json)
    expect(looksLikeSetupPayload(payload)).toBe(true)
    // Byte-mode QR capacity at version 40/L is 2953 — stay well inside it.
    expect(payload.length).toBeLessThan(2500)

    const decoded = await decodeSetupPayload(payload)
    expect(decoded).toBe(json)

    // And the decoded JSON flows through the normal import path.
    const preview = parseImport(decoded, emptyState())
    expect(preview.kind).toBe('setup')
    expect(preview.foods).toBe(15)
  })

  it('decodes the uncompressed fallback format', async () => {
    const json = '{"app":"nomnom-gacha","kind":"setup","foods":[],"machine":{}}'
    const payload = QR_PREFIX_PLAIN + btoa(json)
    expect(await decodeSetupPayload(payload)).toBe(json)
  })

  it('rejects foreign and corrupt payloads', async () => {
    await expect(decodeSetupPayload('https://example.com/qr')).rejects.toThrow('not-nomnom')
    await expect(decodeSetupPayload('NNG1:@@not-base64@@')).rejects.toThrow('not-nomnom')
    expect(looksLikeSetupPayload('WIFI:S:homenet;;')).toBe(false)
  })
})

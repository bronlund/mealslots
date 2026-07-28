import type { Food } from '../data/types'
import type { Rng } from './rng'

/**
 * The decorative sequence of foods a reel scrolls through before landing.
 * The strip ends with the result so the animation layer can simply scroll to
 * the final index — it never re-implements selection logic.
 * Consecutive duplicates are avoided so the blur looks varied.
 */
export function buildReelStrip(result: Food, pool: Food[], rng: Rng, length = 18): Food[] {
  const source = pool.length > 0 ? pool : [result]
  const strip: Food[] = []
  for (let i = 0; i < length - 1; i++) {
    let candidate = source[Math.floor(rng() * source.length)]
    if (strip.length > 0 && source.length > 1) {
      let guard = 0
      while (candidate.id === strip[strip.length - 1].id && guard < 5) {
        candidate = source[Math.floor(rng() * source.length)]
        guard++
      }
    }
    strip.push(candidate)
  }
  if (strip.length > 0 && strip[strip.length - 1].id === result.id && source.length > 1) {
    const alternative = source.find((f) => f.id !== result.id)
    if (alternative) strip[strip.length - 1] = alternative
  }
  strip.push(result)
  return strip
}

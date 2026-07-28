import { useEffect, useRef, useState } from 'react'
import type { Food } from '../../data/types'
import { FoodIconSvg } from '../../icons/foods'

export const CELL = 88
export const WINDOW = 124

interface ReelProps {
  /** The full scroll strip; the last entry is the landing food. */
  strip: Food[]
  spinning: boolean
  /** Seconds for the scroll of this reel (staggering happens here). */
  duration: number
  /** When true, the current scroll finishes almost instantly. */
  skipped: boolean
  onLand: () => void
}

/**
 * A slot reel driven by a plain CSS transform transition — cheap, 60 fps and
 * trivially skippable by shortening the transition mid-flight.
 */
export function Reel({ strip, spinning, duration, skipped, onLand }: ReelProps) {
  const [offset, setOffset] = useState(() => centerOn(strip.length - 1))
  const [animating, setAnimating] = useState(false)
  const landedRef = useRef(false)

  function centerOn(index: number): number {
    return (WINDOW - CELL) / 2 - index * CELL
  }

  useEffect(() => {
    if (!spinning) return
    landedRef.current = false
    // Jump (no transition) to the top of the strip, then scroll to the end on
    // the next frame so the browser registers both positions.
    setAnimating(false)
    setOffset(centerOn(0))
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true)
        setOffset(centerOn(strip.length - 1))
      })
    })
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, strip])

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ height: WINDOW, width: CELL }}
      data-testid="reel"
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: animating
            ? `transform ${skipped ? 0.15 : duration}s cubic-bezier(0.18, 0.8, 0.32, 1.06)`
            : 'none',
          filter: animating && !skipped ? 'blur(1.5px)' : 'none',
        }}
        onTransitionEnd={() => {
          if (spinning && !landedRef.current) {
            landedRef.current = true
            setAnimating(false)
            onLand()
          }
        }}
      >
        {strip.map((food, i) => (
          <div
            key={`${i}-${food.id}`}
            className="flex items-center justify-center"
            style={{ height: CELL, width: CELL }}
          >
            <div style={{ width: CELL - 14, height: CELL - 14 }}>
              <FoodIconSvg iconId={food.iconId} />
            </div>
          </div>
        ))}
      </div>
      {/* Soft vignette so cells fade at the window edges. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--nn-glass) 0%, transparent 26%, transparent 74%, var(--nn-glass) 100%)',
        }}
      />
    </div>
  )
}

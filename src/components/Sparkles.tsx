import { useMemo } from 'react'
import { motion } from 'motion/react'

interface SparklesProps {
  /** Bump this to replay the burst. */
  burstKey: number
  count?: number
  golden?: boolean
}

/** A celebratory particle burst radiating from the center of its parent. */
export function Sparkles({ burstKey, count = 14, golden = false }: SparklesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.31
        const distance = 70 + ((i * 37) % 60)
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 18,
          scale: 0.5 + ((i * 13) % 10) / 12,
          delay: ((i * 7) % 10) / 60,
          gold: golden || i % 3 !== 0,
        }
      }),
    [count, golden, burstKey],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={`${burstKey}-${i}`}
          className="absolute top-1/2 left-1/2"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: p.scale, opacity: 0 }}
          transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
        >
          <svg viewBox="0 0 20 20" width="18" height="18">
            <path
              d="M 10 1 Q 11.5 8.5 19 10 Q 11.5 11.5 10 19 Q 8.5 11.5 1 10 Q 8.5 8.5 10 1 Z"
              fill={p.gold ? 'var(--nn-star)' : '#ffffff'}
            />
          </svg>
        </motion.span>
      ))}
    </div>
  )
}

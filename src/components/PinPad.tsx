import { useState } from 'react'
import { motion } from 'motion/react'
import { play } from '../audio/sound'
import { haptic } from '../audio/haptics'

interface PinPadProps {
  label: string
  error?: string
  onSubmit: (pin: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export function PinPad({ label, error, onSubmit }: PinPadProps) {
  const [digits, setDigits] = useState('')

  function press(key: string) {
    play('tap')
    haptic.tap()
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    const next = digits + key
    setDigits(next)
    if (next.length === 4) {
      onSubmit(next)
      setDigits('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-body text-base font-semibold text-ink">{label}</p>
      <motion.div
        className="flex gap-3"
        aria-label={label}
        key={error}
        animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.35 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-gold ${
              i < digits.length ? 'bg-accent' : 'bg-surface'
            }`}
          />
        ))}
      </motion.div>
      {error && (
        <p role="alert" className="font-body text-sm font-semibold text-danger">
          {error}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2.5">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(key)}
              aria-label={key === '⌫' ? 'delete' : key}
              className="h-14 w-16 rounded-xl border-2 border-gold bg-surface font-body text-xl font-bold text-ink shadow-panel transition-transform active:translate-y-0.5"
            >
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

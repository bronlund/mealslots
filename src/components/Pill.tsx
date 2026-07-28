import type { ButtonHTMLAttributes } from 'react'
import { play } from '../audio/sound'
import { haptic } from '../audio/haptics'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Pill({ active = false, className = '', onClick, ...rest }: PillProps) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-11 rounded-full border-2 px-3.5 py-1.5 font-body text-sm font-semibold transition-colors ${
        active
          ? 'border-gold-deep bg-accent text-[#3a2a10] shadow-glow'
          : 'border-gold bg-surface text-ink-soft'
      } ${className}`}
      onClick={(e) => {
        play('tap')
        haptic.tap()
        onClick?.(e)
      }}
      {...rest}
    />
  )
}

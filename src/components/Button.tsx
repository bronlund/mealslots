import type { ButtonHTMLAttributes } from 'react'
import { play } from '../audio/sound'
import { haptic } from '../audio/haptics'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  quiet?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-accent text-[#3a2a10] border-gold-deep shadow-panel active:translate-y-0.5 font-bold',
  ghost: 'bg-surface text-ink border-gold active:translate-y-0.5',
  danger: 'bg-surface text-danger border-danger active:translate-y-0.5',
}

export function Button({
  variant = 'ghost',
  quiet = false,
  className = '',
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-xl border-2 px-4 py-2 font-body text-base transition-transform disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      onClick={(e) => {
        if (!quiet) {
          play('tap')
          haptic.tap()
        }
        onClick?.(e)
      }}
      {...rest}
    />
  )
}

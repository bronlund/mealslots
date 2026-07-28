import type { HTMLAttributes, ReactNode } from 'react'
import { Ornaments } from './Ornament'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  ornate?: boolean
}

export function Panel({ children, ornate = true, className = '', ...rest }: PanelProps) {
  return (
    <div
      className={`relative rounded-2xl border-2 border-gold bg-surface shadow-panel ${className}`}
      {...rest}
    >
      {ornate && <Ornaments />}
      {children}
    </div>
  )
}

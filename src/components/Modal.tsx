import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Panel } from './Panel'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  label: string
}

export function Modal({ open, onClose, children, label }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 pb-6 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Panel
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="max-h-[85dvh] overflow-y-auto p-5"
            >
              {children}
            </Panel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

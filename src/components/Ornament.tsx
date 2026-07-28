/** Genshin-style gold filigree corner flourish, mirrored into all four
 *  corners of a panel via CSS transforms. */
function Corner() {
  return (
    <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
      <g fill="none" stroke="var(--nn-gold)" strokeWidth="2" strokeLinecap="round">
        <path d="M 4 36 L 4 12 Q 4 4 12 4 L 36 4" />
        <path d="M 10 30 L 10 16 Q 10 10 16 10 L 30 10" opacity="0.55" strokeWidth="1.5" />
        <circle cx="4" cy="4" r="2.2" fill="var(--nn-gold)" stroke="none" />
        <path d="M 17 4 l 3 -3 l 3 3 l -3 3 Z" fill="var(--nn-gold)" stroke="none" opacity="0.8" />
        <path d="M 4 17 l 3 3 l -3 3 l -3 -3 Z" fill="var(--nn-gold)" stroke="none" opacity="0.8" />
      </g>
    </svg>
  )
}

export function Ornaments() {
  return (
    <>
      <span className="pointer-events-none absolute top-1 left-1" aria-hidden="true">
        <Corner />
      </span>
      <span className="pointer-events-none absolute top-1 right-1 scale-x-[-1]" aria-hidden="true">
        <Corner />
      </span>
      <span className="pointer-events-none absolute bottom-1 left-1 scale-y-[-1]" aria-hidden="true">
        <Corner />
      </span>
      <span
        className="pointer-events-none absolute right-1 bottom-1 scale-[-1]"
        aria-hidden="true"
      >
        <Corner />
      </span>
    </>
  )
}

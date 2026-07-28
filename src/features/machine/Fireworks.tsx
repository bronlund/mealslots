import { useEffect, useRef } from 'react'

interface FireworksProps {
  /** Incrementing counter; each bump replays the show. 0 = never played. */
  burst: number
  golden: boolean
  reducedMotion: boolean
}

const FESTIVE = ['#f5c542', '#e8a33d', '#e2574c', '#7fa65a', '#fffdf5']
const GOLDEN = ['#f5c542', '#ffe08a', '#fff3c4', '#e8a33d', '#ffffff']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

/** A short canvas fireworks show that plays over the machine — celebration
 *  without a popup. Pointer events pass straight through. */
export function Fireworks({ burst, golden, reducedMotion }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (burst === 0 || reducedMotion) return
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = parent.clientWidth
    const height = parent.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const colors = golden ? GOLDEN : FESTIVE
    const particles: Particle[] = []

    function explode(cx: number, cy: number) {
      const count = 34
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.35
        const speed = 55 + Math.random() * 95
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.7,
          color: colors[i % colors.length],
          size: 1.8 + Math.random() * 2.2,
        })
      }
    }

    const rockets = 6
    const schedule = Array.from({ length: rockets }, (_, i) => ({
      at: i * 0.32,
      x: width * (0.15 + Math.random() * 0.7),
      y: height * (0.12 + Math.random() * 0.45),
    }))
    const total = rockets * 0.32 + 1.7

    let raf = 0
    let last = performance.now()
    let elapsed = 0

    function tick(now: number) {
      if (!ctx) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      elapsed += dt

      while (schedule.length > 0 && schedule[0].at <= elapsed) {
        const next = schedule.shift()
        if (next) explode(next.x, next.y)
      }

      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.life += dt
        const alpha = 1 - p.life / p.maxLife
        if (alpha <= 0) continue
        p.vy += 130 * dt
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx * dt
        p.y += p.vy * dt
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (elapsed < total) {
        raf = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, width, height)
    }
  }, [burst, golden, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      aria-hidden="true"
      data-testid="fireworks"
    />
  )
}

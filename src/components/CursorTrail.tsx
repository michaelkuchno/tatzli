import { useEffect, useRef } from 'react'

/** Gentle sparkle/petal trail behind the mouse (canvas, pointer-events none, auto-idle). */
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      cv.width = window.innerWidth * dpr
      cv.height = window.innerHeight * dpr
    }
    resize()
    type P = { x: number; y: number; vx: number; vy: number; life: number; hue: number; r: number }
    const ps: P[] = []
    let raf = 0
    let running = false
    const colors = [45, 340, 190, 280, 25]
    const loop = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cv.width, cv.height)
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.03
        p.life -= 0.022
        if (p.life <= 0) {
          ps.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life
        ctx.fillStyle = `hsl(${p.hue} 90% 65%)`
        ctx.beginPath()
        // 4-point star
        const r = p.r * p.life
        ctx.moveTo(p.x, p.y - r)
        ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + r)
        ctx.quadraticCurveTo(p.x, p.y, p.x - r, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - r)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (ps.length) raf = requestAnimationFrame(loop)
      else running = false
    }
    let last = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const now = performance.now()
      if (now - last < 24) return
      last = now
      ps.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.7) * 1.2, life: 1, hue: colors[Math.floor(Math.random() * colors.length)], r: 5 + Math.random() * 5 })
      if (ps.length > 60) ps.shift()
      if (!running) {
        running = true
        raf = requestAnimationFrame(loop)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[90] h-full w-full" aria-hidden />
}

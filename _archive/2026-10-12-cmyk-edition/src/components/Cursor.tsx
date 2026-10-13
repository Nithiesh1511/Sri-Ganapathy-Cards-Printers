import { useEffect, useRef } from 'react'
import { canHover } from '@/lib/hooks'

/**
 * A registration-mark cursor ring that trails the pointer — the crosshair a press
 * operator lines up plates with. It swells over anything clickable. Fine pointers
 * only; touch devices never see it.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !canHover()) return
    let tx = -100, ty = -100, x = -100, y = -100, raf = 0
    const tick = () => {
      x += (tx - x) * 0.22
      y += (ty - y) * 0.22
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      raf = Math.hypot(tx - x, ty - y) > 0.2 ? requestAnimationFrame(tick) : 0
    }
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY
      el.classList.add('is-on')
      const hot = (e.target as Element | null)?.closest('a, button, input, select, textarea, [data-cursor]')
      el.classList.toggle('is-hot', !!hot)
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => el.classList.remove('is-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="cursor-ring" aria-hidden />
}

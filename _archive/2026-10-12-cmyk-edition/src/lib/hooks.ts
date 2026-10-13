import { useEffect, useRef, useState, type RefObject } from 'react'

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** True once any pointer is a mouse/trackpad that can hover. */
export function canHover(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** Marks every `.reveal` element as it scrolls into view. One observer for the page. */
export function useRevealOnScroll(): void {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Whether an element is on screen (with a margin), for pausing off-screen WebGL. */
export function useInView<T extends Element>(ref: RefObject<T>, margin = '120px'): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setInView(true); return }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}

/**
 * How far through a tall "runway" section the viewer has scrolled, 0 → 1, written
 * into a ref every frame it changes (no React re-render). The section is expected
 * to hold a `position: sticky` stage of one viewport height.
 */
export function useRunwayProgress(sectionRef: RefObject<HTMLElement>): RefObject<number> {
  const progress = useRef(0)
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const runway = Math.max(1, r.height - window.innerHeight)
      progress.current = Math.min(1, Math.max(0, -r.top / runway))
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [sectionRef])
  return progress
}

/** Pointer-driven 3D tilt for CSS cards: sets --rx / --ry, and --mx / --my for glare. */
export function useTilt<T extends HTMLElement>(max = 9): RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !canHover() || prefersReducedMotion()) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      el.classList.add('is-active')
      el.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${(-(y - 0.5) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    }
    const leave = () => {
      el.classList.remove('is-active')
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--rx', '0deg')
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])
  return ref
}

/** Cheap WebGL support probe, so we can fall back to flat artwork instead of a blank box. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

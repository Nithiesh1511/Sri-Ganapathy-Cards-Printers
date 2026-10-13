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
    const show = (el: Element) => { el.classList.add('is-in'); io.unobserve(el) }
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) show(e.target) },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    // Safety net for fast scrolls and anchor jumps that skip past an element between
    // observer callbacks: anything already above the fold is shown too.
    let raf = 0
    const sweep = () => {
      raf = 0
      for (const el of els) if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.92) show(el)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sweep) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
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

/** Cheap WebGL support probe, so we can fall back to flat artwork instead of a blank box. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Calls `onProgress(p)` with how far the viewer is through a tall runway section
 * (0 → 1; the section holds a one-viewport `position: sticky` stage). Runs at most
 * once per frame and only when scrolling or resizing — never a React re-render.
 */
export function useScrollScene(sectionRef: RefObject<HTMLElement>, onProgress: (p: number) => void): void {
  const cb = useRef(onProgress)
  cb.current = onProgress
  useEffect(() => {
    let raf = 0
    let last = -1
    const read = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return
      const runway = Math.max(1, r.height - window.innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / runway))
      if (Math.abs(p - last) < 0.0005) return
      last = p
      cb.current(p)
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
}

/** The id of the section nearest the top of the viewport, for the nav's active marker. */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0])
  const key = ids.join('|')
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const line = window.innerHeight * 0.35
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

/** Sets several CSS custom properties on an element (numbers are written to 4 places). */
export function setVars(el: HTMLElement | null, vars: Record<string, number | string>): void {
  if (!el) return
  for (const k in vars) {
    const v = vars[k]
    el.style.setProperty(k, typeof v === 'number' ? v.toFixed(4) : v)
  }
}

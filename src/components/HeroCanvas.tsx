import { useEffect, useRef } from 'react'
import { HeroScene, type HeroProgress } from '@/three/HeroScene'

/** The hero's WebGL canvas. Lazy-loaded, so three.js stays out of the first paint. */
export default function HeroCanvas({ progress, onFailure }: { progress: HeroProgress; onFailure: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const failure = useRef(onFailure)
  failure.current = onFailure

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    // A fresh <canvas> per mount: a released context can't be reused (React dev double-mount).
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.opacity = '0'
    canvas.style.transition = 'opacity 1.2s ease'
    wrap.appendChild(canvas)

    let scene: HeroScene
    try {
      scene = new HeroScene(canvas, progress)
    } catch {
      canvas.remove()
      failure.current()
      return
    }

    const fit = () => scene.resize(wrap.clientWidth, wrap.clientHeight)
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    fit()

    const onMove = (e: PointerEvent) =>
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    window.addEventListener('pointermove', onMove, { passive: true })

    // Only spend GPU time while the hero is on screen, and resume when the tab returns.
    const io = new IntersectionObserver(([en]) => scene.setActive(en.isIntersecting))
    io.observe(wrap)
    const onVis = () => { if (!document.hidden) scene.setActive(true) }
    document.addEventListener('visibilitychange', onVis)
    scene.start()

    // Paint the cards with the real webfonts (waiting 2.5 s at most), then fade in.
    let alive = true
    Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(() => {
      if (!alive) return
      scene.refreshArt()
      requestAnimationFrame(() => { if (alive) canvas.style.opacity = '1' })
    })

    const onLost = (e: Event) => { e.preventDefault(); failure.current() }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      alive = false
      canvas.removeEventListener('webglcontextlost', onLost)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
      ro.disconnect()
      scene.dispose()
      canvas.remove()
    }
  }, [progress])

  return <div ref={wrapRef} className="absolute inset-0" />
}

import { useEffect, useRef } from 'react'
import { HeroScene, type HeroProgress } from '@/three/HeroScene'
import { prefersReducedMotion } from '@/lib/hooks'
import { useTheme } from '@/lib/theme'

/** The hero's WebGL canvas. Lazy-loaded, so three.js stays out of the first paint. */
export default function HeroCanvas({
  progress,
  onFailure,
  onReady,
}: {
  progress: HeroProgress
  onFailure?: () => void
  /** Called once the scene has its fonts and has painted a few frames — and the canvas is faded in. */
  onReady?: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const failure = useRef(onFailure)
  failure.current = onFailure
  const ready = useRef(onReady)
  ready.current = onReady
  const { theme, subscribe } = useTheme()
  // The scene is built once; later theme changes arrive through `subscribe`.
  const initialTheme = useRef(theme)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    // A fresh <canvas> per mount: a context that has been released can't be reused,
    // and React's dev double-mount would otherwise hand the second scene a dead one.
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full'
    canvas.setAttribute('aria-hidden', 'true')
    // Held back until the card art has its real fonts, then faded in.
    canvas.style.opacity = '0'
    canvas.style.transition = 'opacity 0.9s ease'
    wrap.appendChild(canvas)

    let scene: HeroScene
    try {
      scene = new HeroScene(canvas, progress, { reduceMotion: prefersReducedMotion(), theme: initialTheme.current })
    } catch {
      canvas.remove()
      failure.current?.()
      return
    }
    const unsubscribe = subscribe((t) => scene.applyTheme(t))

    const fit = () => scene.resize(wrap.clientWidth, wrap.clientHeight)
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    fit()

    // Pointer parallax, measured from the middle of the screen.
    const onMove = (e: PointerEvent) => {
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // Only spend GPU time while the hero is on screen.
    const io = new IntersectionObserver(([en]) => scene.setActive(en.isIntersecting), { rootMargin: '80px' })
    io.observe(wrap)
    scene.start()

    // Wait (briefly) for the webfonts, redraw the card art with them, let a couple of frames
    // land, then reveal. A slow font host never holds the page hostage: 2.5 s at most.
    let alive = true
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    Promise.race([fontsReady, new Promise((r) => window.setTimeout(r, 2500))]).then(() => {
      if (!alive) return
      scene.refreshArt()
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!alive) return
        canvas.style.opacity = '1'
        ready.current?.()
      }))
    })

    const onLost = (e: Event) => { e.preventDefault(); failure.current?.() }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      alive = false
      canvas.removeEventListener('webglcontextlost', onLost)
      window.removeEventListener('pointermove', onMove)
      unsubscribe()
      io.disconnect()
      ro.disconnect()
      scene.dispose()
      canvas.remove()
    }
  }, [progress, subscribe])

  return <div ref={wrapRef} className="absolute inset-0" />
}

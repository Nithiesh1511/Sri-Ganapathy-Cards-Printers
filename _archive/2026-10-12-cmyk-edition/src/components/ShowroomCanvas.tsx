import { useEffect, useRef } from 'react'
import { ShowroomScene } from '@/three/ShowroomScene'
import { prefersReducedMotion } from '@/lib/hooks'
import { useTheme } from '@/lib/theme'
import type { ServiceId } from '@/data/site'

/** The showroom's WebGL stage. Lazy-loaded alongside three.js. */
export default function ShowroomCanvas({
  selected,
  onInteract,
  onFailure,
}: {
  selected: ServiceId
  onInteract?: () => void
  onFailure?: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ShowroomScene | null>(null)
  const latest = useRef({ selected, onInteract, onFailure })
  latest.current = { selected, onInteract, onFailure }
  const { theme, subscribe } = useTheme()
  const initialTheme = useRef(theme)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    // Fresh canvas per mount (see HeroCanvas): a released context can't be reused.
    const canvas = document.createElement('canvas')
    canvas.className = 'block h-full w-full cursor-grab active:cursor-grabbing'
    canvas.setAttribute('aria-hidden', 'true')
    wrap.appendChild(canvas)

    let scene: ShowroomScene
    try {
      scene = new ShowroomScene(canvas, { reduceMotion: prefersReducedMotion(), theme: initialTheme.current })
    } catch {
      canvas.remove()
      latest.current.onFailure?.()
      return
    }
    sceneRef.current = scene
    const unsubscribe = subscribe((t) => scene.applyTheme(t))
    scene.onInteract = () => latest.current.onInteract?.()

    const fit = () => scene.resize(wrap.clientWidth, wrap.clientHeight)
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    fit()
    scene.setModel(latest.current.selected)

    const io = new IntersectionObserver(([e]) => scene.setActive(e.isIntersecting), { rootMargin: '100px' })
    io.observe(wrap)
    scene.start()

    document.fonts?.ready.then(() => scene.refreshArt())
    const onLost = (e: Event) => { e.preventDefault(); latest.current.onFailure?.() }
    canvas.addEventListener('webglcontextlost', onLost)

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      unsubscribe()
      io.disconnect()
      ro.disconnect()
      scene.dispose()
      sceneRef.current = null
      canvas.remove()
    }
  }, [subscribe])

  useEffect(() => { sceneRef.current?.setModel(selected) }, [selected])

  return <div ref={wrapRef} className="absolute inset-0" />
}

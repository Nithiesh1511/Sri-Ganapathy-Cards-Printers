import { useEffect, useRef } from 'react'
import { paintFace, type FaceId } from '@/three/cardArt'

/** One of the hero cards' faces as a plain <canvas> — same artwork as the 3D scene. */
export default function CardFace({ id, className = '' }: { id: FaceId; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    let alive = true
    paintFace(c, id, 'color')
    // Repaint once the webfonts are in, so the lettering is the real typeface.
    document.fonts?.ready.then(() => alive && paintFace(c, id, 'color'))
    return () => { alive = false }
  }, [id])
  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />
}

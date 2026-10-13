import type { CSSProperties } from 'react'
import type { FaceId } from '@/three/cardArt'
import CardFace from './CardFace'

const CARDS: { face: FaceId; x: string; y: string; z: string; r: string; delay: string }[] = [
  { face: 'minimal-front', x: '9%', y: '16%', z: '0px', r: '14deg', delay: '-2s' },
  { face: 'invite-front', x: '-7%', y: '2%', z: '26px', r: '-8deg', delay: '-4.5s' },
  { face: 'brand-front', x: '3%', y: '-14%', z: '52px', r: '3deg', delay: '0s' },
]

/** A light CSS-3D stack of the same three cards: phones, reduced motion, no WebGL. */
export default function CardStackCSS({ className = '' }: { className?: string }) {
  return (
    <div className={`cstack ${className}`} aria-hidden>
      <div className="cstack-inner">
        {CARDS.map((c) => (
          <div
            key={c.face}
            className="cstack-card overflow-hidden"
            style={{ '--x': c.x, '--y': c.y, '--z': c.z, '--r': c.r, '--delay': c.delay } as CSSProperties}
          >
            <CardFace id={c.face} />
          </div>
        ))}
      </div>
    </div>
  )
}

import { useId } from 'react'

/** One blade of the pinwheel, pointing straight up, in a -50…50 box. */
const BLADE = 'M0 -46 Q24 -42 30 -20 Q14 -34 -4 -30 Z'
/** Blade colours around the wheel, as on the card's logo. */
const INKS = ['#211D28', '#00AEEF', '#EC008C', '#FFD400']

/**
 * The shop's mark: a pinwheel of twelve blades around a purple disc with a gold
 * monogram. Redrawn as vector from the logo on the business card so it stays sharp
 * at any size; swap in the original artwork file here if you have it.
 */
export function PinwheelMark({ size = 40, className, spin = false }: { size?: number; className?: string; spin?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} className={className} role="img" aria-label="Sri Ganapathy logo">
      <defs>
        <radialGradient id={`d${id}`} cx="38%" cy="30%" r="85%">
          <stop offset="0" stopColor="#6A35B4" />
          <stop offset="1" stopColor="#2B1453" />
        </radialGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1E2BF" />
          <stop offset="1" stopColor="#C8A56A" />
        </linearGradient>
      </defs>
      <g className={spin ? 'origin-center transition-transform duration-[1600ms] ease-lux group-hover:rotate-[60deg] motion-reduce:transition-none' : undefined}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={BLADE} fill={INKS[i % 4]} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r="33" fill={`url(#d${id})`} />
      <circle r="29" fill="none" stroke={`url(#g${id})`} strokeWidth="1.3" opacity=".95" />
      <path
        d="M-9 -8 C-17 -2 -14 12 -2 13 C8 14 13 7 11 1 L1 1"
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="-1" cy="-17" r="2.1" fill={`url(#g${id})`} />
    </svg>
  )
}

/** Mark + wordmark, for the nav and footer. `light` is for the purple panels. */
export function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`group inline-flex items-center gap-2.5 whitespace-nowrap sm:gap-3 ${className}`}>
      <PinwheelMark size={42} spin className="h-[34px] w-[34px] sm:h-[40px] sm:w-[40px]" />
      <span className="leading-none">
        <span className={`block font-display text-[1.32rem] font-semibold italic tracking-tight sm:text-[1.5rem] ${light ? 'text-ivory' : 'text-plum'}`}>
          Sri Ganapathy
        </span>
        <span className={`mt-1 block text-[8px] font-bold uppercase tracking-[0.34em] sm:text-[8.5px] sm:tracking-[0.4em] ${light ? 'text-gold-hi' : 'text-ink-soft'}`}>
          Cards &amp; Printers
        </span>
      </span>
    </span>
  )
}

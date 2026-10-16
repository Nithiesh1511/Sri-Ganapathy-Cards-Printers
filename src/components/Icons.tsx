import type { SVGProps } from 'react'

type I = SVGProps<SVGSVGElement>
const base = (p: I): I => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...p,
})

export const Phone = (p: I) => (
  <svg {...base(p)}><path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 5 5L14.1 12.3l4 1.6V17a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
)
export const Mail = (p: I) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
)
export const Instagram = (p: I) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></svg>
)
export const Arrow = (p: I) => (
  <svg {...base(p)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
)
export const ArrowDown = (p: I) => (
  <svg {...base(p)}><path d="M12 4v15M6 13l6 6 6-6" /></svg>
)
export const Menu = (p: I) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)
export const Close = (p: I) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const Spark = (p: I) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M12 1.5c.7 5.6 2.9 8.8 10.5 10.5-7.6 1.7-9.8 4.9-10.5 10.5C11.3 16.9 9.1 13.7 1.5 12 9.1 10.3 11.3 7.1 12 1.5Z" /></svg>
)
export const Cube = (p: I) => (
  <svg {...base(p)}><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></svg>
)
export const WhatsApp = (p: I) => (
  <svg {...base(p)}><path d="M4 20l1.3-3.9A8.5 8.5 0 1 1 8.1 19L4 20Z" /><path d="M9 8.6c0 3.3 3 6.4 6.4 6.4l1.1-1.6-2-1-1 .8a5 5 0 0 1-2.7-2.7l.8-1-1-2L9 8.6Z" strokeWidth="1.4" /></svg>
)
export const Download = (p: I) => (
  <svg {...base(p)}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
)
export const RotateCcw = (p: I) => (
  <svg {...base(p)}><path d="M4 4v5h5" /><path d="M5.5 15a7 7 0 1 0 1.2-7.5L4 9" /></svg>
)
export const Flip = (p: I) => (
  <svg {...base(p)}><path d="M12 3v18" strokeDasharray="2 2.5" /><path d="M9 7 4 17h5V7ZM15 7l5 10h-5V7Z" /></svg>
)
export const Check = (p: I) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
export const Alert = (p: I) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.4v.1" /></svg>
)
export const Clock = (p: I) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
)
export const Shield = (p: I) => (
  <svg {...base(p)}><path d="M12 3 5 6v5.5c0 4.4 2.9 7.9 7 9.5 4.1-1.6 7-5.1 7-9.5V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>
)
export const Truck = (p: I) => (
  <svg {...base(p)}><path d="M3 6.5h11V16H3zM14 9.5h4l3 3V16h-7" /><circle cx="7.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
)
export const Tag = (p: I) => (
  <svg {...base(p)}><path d="M3 12.5V4h8.5L21 13.5 13.5 21 3 12.5Z" /><circle cx="7.5" cy="8.5" r="1.3" /></svg>
)

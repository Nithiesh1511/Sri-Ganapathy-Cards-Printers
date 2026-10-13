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

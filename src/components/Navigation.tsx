import { useEffect, useState } from 'react'
import { BUSINESS } from '@/data/site'
import { useActiveSection } from '@/lib/hooks'
import { Logo } from './Logo'
import { Close, Menu, Phone } from './Icons'

/** Nav items, each covering the page sections listed in `sections` (in page order). */
const LINKS = [
  { href: '#home', label: 'Home', sections: ['home', 'story'] },
  { href: '#services', label: 'Our Services', sections: ['services', 'school'] },
  { href: '#craft', label: 'Our Craft', sections: ['craft', 'customize', 'quality'] },
  { href: '#about', label: 'About', sections: ['about'] },
  { href: '#contact', label: 'Contact', sections: ['contact'] },
]
const ALL_SECTIONS = LINKS.flatMap((l) => l.sections)

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const activeSection = useActiveSection(ALL_SECTIONS)
  const active = LINKS.find((l) => l.sections.includes(activeSection))?.href

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-700 ease-lux ${
        solid ? 'bg-ivory/90 shadow-[0_1px_0_rgb(64_32_120/0.08),0_10px_30px_-20px_rgb(64_32_120/0.3)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className={`wrap flex items-center justify-between gap-6 transition-[height] duration-700 ease-lux ${scrolled ? 'h-[68px]' : 'h-[84px]'}`}>
        <a href="#home" aria-label={`${BUSINESS.name} — home`} onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href ? 'true' : undefined}
              className={`nav-link text-[0.86rem] font-semibold transition-colors duration-300 ${active === l.href ? 'text-plum' : 'text-ink-soft hover:text-plum'}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Let&rsquo;s Print Something
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-plum/15 text-plum lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu: slides down as a sheet of paper. */}
      <div
        id="mobile-menu"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-700 ease-lux lg:hidden ${open ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'}`}
        // React 18 has no `inert` prop; an empty attribute keeps the closed menu out of tab order.
        {...(open ? {} : { inert: '' })}
      >
        <div className="min-h-0">
          <nav className="wrap flex h-[calc(100svh-84px)] flex-col pb-8 pt-4" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`border-b border-plum/10 py-4 font-display text-[2.1rem] font-medium transition-[transform,opacity] duration-700 ease-lux ${active === l.href ? 'text-violet' : 'text-plum'} ${open ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : '0ms' }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <a href="#contact" onClick={() => setOpen(false)} className="btn btn-primary">Let&rsquo;s Print Something</a>
              <a href={`tel:${BUSINESS.phones[0].tel}`} className="btn btn-outline">
                <Phone width={18} /> {BUSINESS.phones[0].display}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

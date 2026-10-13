import { useEffect, useState } from 'react'
import { BUSINESS } from '@/data/site'
import { Logo } from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import { Close, Menu, Phone } from './Icons'

const LINKS = [
  { id: 'top', href: '#top', label: 'Home' },
  { id: 'promises', href: '#promises', label: 'What we do' },
  { id: 'showroom', href: '#showroom', label: 'Showroom' },
  { id: 'contact', href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('top')

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Highlight the section in view.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach((l) => { const el = document.getElementById(l.id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-700 ease-lux ${
          scrolled ? 'bg-paper/90 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className={`container-x flex items-center justify-between transition-[height] duration-700 ease-lux ${scrolled ? 'h-[68px]' : 'h-[84px]'}`}>
          <a href="#top" aria-label="Sri Ganapathy Cards and Printers — home">
            <Logo />
          </a>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={l.href}
                className={`group relative py-2 font-sans text-[11px] font-bold uppercase tracking-[0.28em] transition-colors duration-500 ${
                  active === l.id ? 'text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-gradient-to-r from-gold-lo via-gold-hi to-gold transition-transform duration-700 ease-lux ${
                    active === l.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitcher />
            <a href={`tel:${BUSINESS.phones[0].tel}`} className="btn btn-ghost !min-h-[2.75rem] !px-3.5 !py-2.5 sm:!px-5" aria-label="Call now">
              <Phone width={16} />
              <span className="hidden sm:inline">Call now</span>
            </a>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-gold/10 lg:hidden"
            >
              <Menu />
            </button>
          </div>
        </div>
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent transition-opacity duration-700 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        />
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[60] overflow-y-auto bg-night text-ivory transition-opacity duration-500 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="container-x flex min-h-full flex-col py-5">
          <div className="flex items-center justify-between">
            <Logo light />
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-gold-hi/40">
              <Close />
            </button>
          </div>
          <nav className="mt-10 flex flex-col" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <a
                key={l.id}
                href={l.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="group flex items-baseline gap-5 border-b border-gold-hi/20 py-4 font-display text-[2.3rem] italic leading-none"
              >
                <span className="font-sans text-[10px] font-bold not-italic tracking-[0.3em] text-gold-hi/70">0{i + 1}</span>
                <span className="foil-text-lt">{l.label}</span>
              </a>
            ))}
          </nav>
          <div className="mt-8">
            <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.34em] text-gold-hi/80">Theme</p>
            <ThemeSwitcher inline />
          </div>
          <div className="mt-auto space-y-2.5 pb-4 pt-8">
            {BUSINESS.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} tabIndex={open ? 0 : -1} className="btn btn-ivory w-full">
                <Phone width={17} /> {p.display}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/lib/theme'
import type { ThemeConfig, ThemeId } from '@/data/themes'

/** A round chip showing a theme as three colours: page, gold, text. */
function Chip({ t, size = 26 }: { t: ThemeConfig; size?: number }) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-gold/70"
      style={{ width: size, height: size, background: t.swatch[0] }}
      aria-hidden
    >
      <i className="absolute inset-y-0 right-0 w-1/2" style={{ background: t.swatch[1] }} />
      <i className="absolute bottom-0 left-0 h-[34%] w-full" style={{ background: t.swatch[2], opacity: 0.9 }} />
    </span>
  )
}

/**
 * Theme picker. In the nav it is a small chip that opens a list; `inline` lays the
 * four themes out as a grid (used in the mobile menu). Picking one reveals it in a
 * circle growing out from the button you pressed.
 */
export default function ThemeSwitcher({ inline = false }: { inline?: boolean }) {
  const { theme, themes, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const pick = (id: ThemeId, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setTheme(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
    if (!inline) window.setTimeout(() => setOpen(false), 350)
  }

  const list = (
    <ul role="radiogroup" aria-label="Colour theme" className={inline ? 'grid grid-cols-2 gap-3' : 'space-y-1'}>
      {themes.map((t) => {
        const on = t.id === theme.id
        return (
          <li key={t.id}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={(e) => pick(t.id, e.currentTarget)}
              className={`group flex w-full items-center rounded-xl border py-2.5 text-left transition-colors duration-500 ${inline ? 'gap-2.5 px-2.5' : 'gap-3 px-3'} ${
                on
                  ? inline ? 'border-gold-hi/70 bg-ivory/10' : 'border-gold/60 bg-gold/10'
                  : inline ? 'border-ivory/15 hover:border-gold-hi/50' : 'border-transparent hover:bg-gold/10'
              }`}
            >
              <Chip t={t} size={inline ? 30 : 28} />
              <span className="min-w-0">
                <span className={`block font-display leading-tight ${inline ? 'text-[14px] text-ivory' : 'truncate text-[15px] text-ink'}`}>{t.name}</span>
                {!inline && <span className="block truncate font-sans text-[11px] text-ink-mute">{t.mood}</span>}
              </span>
              {on && !inline && <span className="ml-auto text-[13px] text-gold" aria-hidden>✦</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )

  if (inline) return list

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Colour theme: ${theme.name}. Change theme`}
        onClick={() => setOpen((o) => !o)}
        className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 transition-colors duration-500 hover:border-gold hover:bg-gold/10"
      >
        <Chip t={theme} />
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[17.5rem] origin-top-right rounded-2xl border border-gold/40 bg-card/95 p-3 shadow-lift backdrop-blur-xl transition duration-500 ease-lux ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <p className="px-2 pb-2 pt-1 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gold-text">Choose a theme</p>
        {list}
      </div>
    </div>
  )
}

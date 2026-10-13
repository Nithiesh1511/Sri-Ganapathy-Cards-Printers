import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ACCENT_HEX, ALL_SERVICES, GROUPS, groupOf, serviceById, type ServiceId } from '@/data/site'
import { hasWebGL, prefersReducedMotion, useInView } from '@/lib/hooks'
import { openContact } from '@/lib/actions'
import { Arrow, Cube } from './Icons'

const ShowroomCanvas = lazy(() => import('./ShowroomCanvas'))

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}
/** The key plate is near-black, which vanishes on the dark stage — show it as a soft violet. */
const inkOf = (accent: keyof typeof ACCENT_HEX) => (ACCENT_HEX[accent] === '#16121E' ? '#A28DEF' : ACCENT_HEX[accent])

/**
 * The Print Showroom: every service on the card, as a 3D object on a turntable.
 * Choose from the list (or let it cycle), drag to turn the object round, and send
 * an enquiry about the one you're looking at. The room is always dark — a gallery
 * at night — in every theme; the theme tints the light in it.
 */
export default function Showroom() {
  const [selected, setSelected] = useState<ServiceId>('visiting-card')
  const [glOk, setGlOk] = useState(() => hasWebGL())
  const [hovering, setHovering] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const interacted = useRef(false)
  const inView = useInView(stageRef, '0px')
  const reduced = useMemo(prefersReducedMotion, [])

  const service = serviceById(selected)
  const group = groupOf(selected)
  const index = ALL_SERVICES.findIndex((s) => s.id === selected)
  const accent = inkOf(service.accent)

  const go = useCallback((delta: number, manual = false) => {
    if (manual) interacted.current = true
    setSelected((cur) => {
      const i = ALL_SERVICES.findIndex((s) => s.id === cur)
      return ALL_SERVICES[(i + delta + ALL_SERVICES.length) % ALL_SERVICES.length].id
    })
  }, [])

  const choose = (id: ServiceId) => { interacted.current = true; setSelected(id) }

  // Let the page's other sections point the showroom at a product.
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<ServiceId>).detail
      if (id) choose(id)
    }
    window.addEventListener('showroom:select', on)
    return () => window.removeEventListener('showroom:select', on)
  }, [])

  // Cycle through the range on its own — until the visitor takes over.
  useEffect(() => {
    if (!inView || interacted.current || hovering || reduced || !glOk) return
    const id = window.setInterval(() => go(1), 6800)
    return () => window.clearInterval(id)
  }, [inView, hovering, reduced, glOk, go, selected])

  // Keep the active chip in view in the horizontally scrolling mobile list.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${selected}"]`)
    const box = listRef.current
    if (el && box && box.scrollWidth > box.clientWidth + 4 && getComputedStyle(box).overflowX !== 'visible') {
      box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
    }
  }, [selected])

  const enquire = () => openContact({ service: selected })

  // The product's own ink lights the stage; set here so a change cross-fades.
  const stageStyle = { '--glow-rgb': hexToRgb(accent) } as CSSProperties

  return (
    <section id="showroom" className="relative overflow-hidden bg-night py-24 text-ivory sm:py-36">
      {/* backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="halftone halftone-fade absolute inset-0 text-gold/[0.12]" />
        <div className="absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.13] blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-wine/[0.16] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-hi/50 to-transparent" />
      </div>

      <div className="container-x relative">
        <header className="reveal max-w-3xl">
          <p className="eyebrow mb-6 !text-gold-hi">The Print Showroom</p>
          <h2 className="text-balance font-display text-[2.6rem] font-normal leading-[1.04] sm:text-6xl">
            Pick it up. <span className="foil-text-lt italic">Turn it around.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-ivory/70 sm:text-[17px]">
            Every one of the {ALL_SERVICES.length} things we print, bind and finish — on a turntable. Drag to spin it,
            or choose from the list.
          </p>
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-8">
          {/* List */}
          <div
            ref={listRef}
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:block lg:max-h-[660px] lg:space-y-6 lg:overflow-y-auto lg:overflow-x-visible lg:px-0 lg:pb-0 lg:pr-2"
            role="group"
            aria-label="Choose a product"
          >
            {GROUPS.map((g) => (
              <div key={g.id} className="flex shrink-0 gap-2 lg:block">
                <div className="mb-2.5 hidden items-baseline justify-between lg:flex">
                  <h3 className="foil-text-lt font-display text-xl font-normal italic">{g.name}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/45">{g.items.length}</span>
                </div>
                <ul className="flex gap-2 lg:block lg:overflow-hidden lg:rounded-2xl lg:border lg:border-gold-hi/20 lg:bg-ivory/[0.03]">
                  {g.items.map((s) => {
                    const on = s.id === selected
                    const n = ALL_SERVICES.findIndex((x) => x.id === s.id) + 1
                    return (
                      <li key={s.id} className="shrink-0 lg:border-b lg:border-gold-hi/10 lg:last:border-b-0">
                        <button
                          type="button"
                          data-id={s.id}
                          data-cursor
                          aria-pressed={on}
                          onClick={() => choose(s.id)}
                          className={`group flex w-full items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 text-left font-sans text-[13px] font-bold transition-colors duration-500 lg:rounded-none lg:border-0 lg:px-4 lg:py-3 ${
                            on
                              ? 'border-gold-hi bg-gradient-to-r from-gold-hi to-gold text-on-gold'
                              : 'border-ivory/20 text-ivory/80 hover:border-gold-hi/60 hover:text-ivory lg:hover:bg-ivory/[0.06]'
                          }`}
                        >
                          <span className={`font-mono text-[10px] tracking-[0.14em] ${on ? 'text-on-gold/60' : 'text-ivory/40'}`}>{String(n).padStart(2, '0')}</span>
                          <span className="flex-1">{s.name}</span>
                          <i
                            className="block h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                            style={{ background: inkOf(s.accent), boxShadow: on ? '0 0 0 3px rgba(0,0,0,0.22)' : undefined }}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Stage: on phones a column (3D on top, details below); from sm up the details overlay the 3D. */}
          <div
            ref={stageRef}
            style={stageStyle}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            className="reveal relative flex flex-col overflow-hidden rounded-[2rem] border border-gold-hi/30 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] sm:block sm:h-[580px] lg:h-[660px]"
            role="group"
            aria-label="3D product viewer"
          >
            <div
              aria-hidden
              className="absolute inset-0 transition-[background] duration-700"
              style={{
                backgroundColor: 'rgb(var(--night))',
                backgroundImage:
                  'radial-gradient(60% 50% at 50% 58%, rgba(var(--glow-rgb), 0.26) 0%, rgba(var(--glow-rgb), 0) 70%), radial-gradient(90% 70% at 50% 112%, rgb(var(--gold) / 0.28) 0%, rgb(var(--gold) / 0) 65%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
              }}
            />
            {/* inner keyline, like the frame round a plate */}
            <div aria-hidden className="pointer-events-none absolute inset-2 rounded-[1.6rem] border border-gold-hi/15" />

            <div className="relative h-[360px] shrink-0 sm:absolute sm:inset-0 sm:h-auto">
              {glOk ? (
                <Suspense fallback={<div className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.2em] text-ivory/50">Warming up the press…</div>}>
                  <ShowroomCanvas selected={selected} onInteract={() => { interacted.current = true }} onFailure={() => setGlOk(false)} />
                </Suspense>
              ) : (
                <div className="absolute inset-0 grid place-items-center px-8 text-center">
                  <p className="max-w-xs font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-ivory/60">
                    The 3D view needs WebGL, which this browser has switched off. The full range is in the list.
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 sm:p-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/60">
                  <span className="text-gold-hi">{String(index + 1).padStart(2, '0')}</span> / {ALL_SERVICES.length}
                  <span className="mx-2 text-ivory/30">·</span>
                  {group.name}
                </div>
                <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/55 sm:flex">
                  <Cube width={15} /> Drag to turn
                </div>
              </div>
            </div>

            <div className="relative flex flex-col gap-5 p-5 pt-2 sm:pointer-events-none sm:absolute sm:inset-x-0 sm:bottom-0 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div key={selected} className="max-w-[28rem] animate-rise-in">
                <h3 className="foil-text-lt font-display text-[2.1rem] font-normal italic leading-none sm:text-5xl" aria-live="polite">{service.name}</h3>
                <p className="mt-3 text-[14px] font-light leading-relaxed text-ivory/75 sm:text-[16px]">{service.blurb}</p>
              </div>
              <div className="pointer-events-auto flex items-center gap-3">
                <button type="button" aria-label="Previous product" onClick={() => go(-1, true)} className="grid h-12 w-12 place-items-center rounded-full border border-gold-hi/50 text-ivory transition duration-500 hover:bg-gold-hi hover:text-on-gold">
                  <Arrow width={18} className="rotate-180" />
                </button>
                <button type="button" aria-label="Next product" onClick={() => go(1, true)} className="grid h-12 w-12 place-items-center rounded-full border border-gold-hi/50 text-ivory transition duration-500 hover:bg-gold-hi hover:text-on-gold">
                  <Arrow width={18} />
                </button>
                <button type="button" onClick={enquire} className="btn btn-gold !px-6">
                  Enquire <Arrow width={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

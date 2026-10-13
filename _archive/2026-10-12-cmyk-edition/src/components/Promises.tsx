import type { ReactNode } from 'react'
import { ACCENT_HEX, GROUPS, PROMISES, serviceById, type ServiceId } from '@/data/site'
import { useTilt } from '@/lib/hooks'
import { openInShowroom } from '@/lib/actions'
import { Arrow } from './Icons'

// ── Illustrations: three SVG layers each, at three depths inside the tilting card ──
const S = { stroke: '#16121E', strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
/** Outline only — for shapes that carry no fill of their own. */
const N = { ...S, fill: 'none' }

function SchoolArt() {
  return (
    <>
      <svg className="z1 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(-7 130 130)">
          <rect x="52" y="34" width="172" height="196" rx="12" fill="#fff" {...S} />
          <rect x="52" y="34" width="172" height="40" rx="12" fill="#00AEEF" {...S} />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M72 ${96 + i * 22}H206`} stroke="#16121E" strokeOpacity=".2" strokeWidth="2" />)}
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx="52" cy={50 + i * 24} r="5" fill="#FFF6EE" {...S} strokeWidth={2.4} />)}
          <path d="M78 56h70" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
      <svg className="z2 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(8 220 150)">
          <rect x="170" y="86" width="104" height="144" rx="12" fill="#FFF6EE" {...S} />
          <rect x="170" y="86" width="104" height="34" rx="12" fill="#4B2BB8" {...S} />
          <circle cx="222" cy="154" r="19" fill="#EC008C" {...S} />
          <path d="M184 206H260M190 218H254" stroke="#16121E" strokeWidth="3" />
        </g>
        <g transform="rotate(38 80 190)">
          <rect x="22" y="178" width="130" height="24" rx="4" fill="#FFD400" {...S} />
          <path d="M152 178l26 12-26 12z" fill="#F5D6C8" {...S} />
          <rect x="4" y="178" width="20" height="24" rx="4" fill="#EC008C" {...S} />
        </g>
      </svg>
      <svg className="z3 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(-10 62 200)">
          <rect x="30" y="160" width="68" height="68" rx="14" fill="#EC008C" {...S} />
          <text x="64" y="212" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700" fontStyle="italic" fontSize="44" fill="#fff">A</text>
        </g>
        <path d="M268 36l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#FFD400" {...S} strokeWidth={2.5} />
      </svg>
    </>
  )
}

function InviteArt() {
  return (
    <>
      <svg className="z1 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(-5 160 170)">
          <rect x="44" y="104" width="232" height="126" rx="8" fill="#F2E2BD" {...S} />
          <path d="M44 108l116 66 116-66" {...N} />
        </g>
      </svg>
      <svg className="z2 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(4 160 120)">
          <rect x="96" y="28" width="132" height="176" rx="10" fill="#6B1236" {...S} />
          <rect x="106" y="38" width="112" height="156" rx="6" fill="none" stroke="#EBD08F" strokeWidth="2" />
          <g transform="translate(162 82)" fill="none" stroke="#EBD08F" strokeWidth="2">
            {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="0" cy="-20" rx="6" ry="14" transform={`rotate(${i * 30})`} />)}
            <circle r="6" fill="#EBD08F" />
          </g>
          <path d="M128 128h68M136 144h52M142 160h40" stroke="#EBD08F" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
      <svg className="z3 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <circle cx="236" cy="196" r="26" fill="#C8962E" {...S} />
        <circle cx="236" cy="196" r="15" fill="none" stroke="#16121E" strokeWidth="2.5" />
        <circle cx="62" cy="64" r="9" fill="#00AEEF" {...S} strokeWidth={2.5} />
        <circle cx="274" cy="60" r="8" fill="#FFD400" {...S} strokeWidth={2.5} />
        <path d="M44 196l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#EC008C" {...S} strokeWidth={2.5} />
      </svg>
    </>
  )
}

function BusinessArt() {
  return (
    <>
      <svg className="z1 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(-6 120 130)">
          <rect x="48" y="26" width="148" height="204" rx="8" fill="#fff" {...S} />
          <circle cx="82" cy="58" r="16" fill="#4B2BB8" {...S} />
          <path d="M108 52h70M108 66h50" stroke="#16121E" strokeWidth="3" />
          <path d="M66 100H178M66 120H178M66 140H178M66 160H150" stroke="#16121E" strokeOpacity=".2" strokeWidth="2" />
          <rect x="48" y="206" width="148" height="24" rx="6" fill="#FFD400" {...S} />
        </g>
      </svg>
      <svg className="z2 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g transform="rotate(-14 230 150)"><rect x="168" y="118" width="124" height="74" rx="8" fill="#00AEEF" {...S} /></g>
        <g transform="rotate(-2 230 150)"><rect x="168" y="118" width="124" height="74" rx="8" fill="#EC008C" {...S} /></g>
        <g transform="rotate(10 230 150)">
          <rect x="168" y="118" width="124" height="74" rx="8" fill="#FFF6EE" {...S} />
          <circle cx="198" cy="148" r="14" fill="#4B2BB8" {...S} strokeWidth={2.5} />
          <path d="M222 140h52M222 154h38M180 176h92" stroke="#16121E" strokeWidth="3" />
        </g>
      </svg>
      <svg className="z3 absolute inset-0 h-full w-full" viewBox="0 0 320 250" aria-hidden>
        <g>
          <rect x="196" y="186" width="84" height="26" rx="6" fill="#16121E" />
          <rect x="206" y="160" width="64" height="30" rx="8" fill="#8A4F26" {...S} />
          <circle cx="238" cy="140" r="20" fill="#8A4F26" {...S} />
          <rect x="226" y="152" width="24" height="10" fill="#8A4F26" {...S} />
        </g>
        <path d="M60 210l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#FFD400" {...S} strokeWidth={2.5} />
      </svg>
    </>
  )
}

interface Promise3D {
  n: string
  kicker: string
  art: ReactNode
  accent: 'cy' | 'mg' | 'ye'
  picks: ServiceId[]
  tint: string
}

const CARDS: Promise3D[] = [
  { n: 'I', kicker: 'For schools', art: <SchoolArt />, accent: 'cy', tint: '#E3F3FA', picks: ['id-card', 'paper-charts', 'diary', 'book-binding', 'spiral-binding'] },
  { n: 'II', kicker: 'For every occasion', art: <InviteArt />, accent: 'mg', tint: '#F9E6EF', picks: ['invitation', 'offset', 'screen', 'flex'] },
  { n: 'III', kicker: 'For business', art: <BusinessArt />, accent: 'ye', tint: '#FAF1CC', picks: ['visiting-card', 'letterhead', 'bill-book', 'stamp', 'monthly-calendar'] },
]

function PromiseCard({ card, text, index }: { card: Promise3D; text: string; index: number }) {
  const ref = useTilt<HTMLElement>(7)
  const accent = ACCENT_HEX[card.accent]
  return (
    <div className="tilt-scene reveal" style={{ '--d': index } as React.CSSProperties}>
      <article ref={ref} className="tilt panel flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <span className="eyebrow eyebrow--plain gap-2.5 !text-ink-soft">
            <i className="block h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {card.kicker}
          </span>
          <span className="foil-text z2 font-display text-[2.4rem] italic leading-none">{card.n}</span>
        </div>

        {/* The illustration sits on a proof plate: always light, framed in gilt, whatever the theme. */}
        <div
          className="relative my-5 aspect-[320/250] w-full overflow-hidden rounded-xl ring-1 ring-gold/50"
          style={{ transformStyle: 'preserve-3d', background: `linear-gradient(160deg, ${card.tint} 0%, #FFFDF8 78%)` }}
        >
          <div aria-hidden className="absolute inset-1.5 rounded-lg border border-[#B8862B]/30" />
          {card.art}
        </div>

        <h3 className="z1 font-display text-[1.65rem] font-normal leading-[1.14] text-ink sm:text-[1.85rem]">{text}</h3>
        <ul className="z1 mt-5 flex flex-wrap gap-2">
          {card.picks.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => openInShowroom(id)}
                className="rounded-full border border-gold/55 px-3.5 py-1.5 font-sans text-[11.5px] font-bold tracking-wide text-ink-soft transition duration-500 ease-lux hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-on-gold"
              >
                {serviceById(id).name}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => openInShowroom(card.picks[0])}
          className="z2 group mt-7 inline-flex items-center gap-3 self-start font-sans text-[11px] font-bold uppercase tracking-[0.26em] text-gold-text"
        >
          See them in 3D
          <Arrow width={16} className="transition-transform duration-500 ease-lux group-hover:translate-x-1.5" />
        </button>
      </article>
    </div>
  )
}

export default function Promises() {
  return (
    <section id="promises" className="relative py-24 sm:py-36">
      <div aria-hidden className="halftone halftone-fade pointer-events-none absolute inset-x-0 top-0 h-80 text-gold/[0.14]" />
      <div className="container-x relative">
        <header className="reveal max-w-3xl">
          <p className="eyebrow mb-6">Three promises</p>
          <h2 className="text-balance font-display text-[2.6rem] font-normal leading-[1.04] sm:text-6xl">
            Printed for school. <span className="foil-text italic">Printed for celebration.</span> Printed for business.
          </h2>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-7 lg:gap-9">
          {CARDS.map((c, i) => (
            <PromiseCard key={c.n} card={c} text={PROMISES[i]} index={i} />
          ))}
        </div>

        {/* The full range, set like the printed card: four columns. */}
        <div className="reveal mt-28">
          <div className="orn mb-10 text-gold">
            <i />
          </div>
          <div className="mb-10 flex items-end justify-between gap-6">
            <h3 className="font-display text-3xl font-normal italic sm:text-5xl">
              The <span className="foil-text">full range</span>
            </h3>
            <span className="cmyk-bar hidden sm:inline-flex"><i /><i /><i /><i /></span>
          </div>
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {GROUPS.map((g) => (
              <div key={g.id}>
                <p className="eyebrow eyebrow--plain mb-5 w-full border-b border-gold/30 pb-4">{g.name}</p>
                <ul className="space-y-0.5">
                  {g.items.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => openInShowroom(s.id)}
                        className="group flex w-full items-center justify-between gap-3 rounded-lg py-1.5 text-left font-display text-[1.4rem] font-normal leading-tight text-ink transition-colors duration-500 hover:text-gold-text"
                      >
                        <span>{s.name}</span>
                        <Arrow width={16} className="shrink-0 -translate-x-2 text-gold opacity-0 transition-all duration-500 ease-lux group-hover:translate-x-0 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

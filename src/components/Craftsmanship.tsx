import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Detail {
  id: string
  title: string
  text: string
  visual: ReactNode
}

const DETAILS: Detail[] = [
  {
    id: 'paper',
    title: 'Paper texture',
    text: 'The weight and tooth of a sheet are the first thing a hand notices.',
    visual: (
      <div className="macro macro-paper h-full">
        {/* A deckled edge, torn by an SVG turbulence filter */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
          <defs>
            <filter id="deckle"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="3" /><feDisplacementMap in="SourceGraphic" scale="14" /></filter>
          </defs>
          <rect x="150" y="-20" width="300" height="360" fill="#FFFDF8" filter="url(#deckle)" style={{ filter: 'url(#deckle) drop-shadow(-6px 4px 10px rgba(43,20,83,.18))' }} />
        </svg>
      </div>
    ),
  },
  {
    id: 'type',
    title: 'Typography',
    text: 'Letters set with care, pressed so they can almost be read by touch.',
    visual: (
      <div className="macro macro-paper flex h-full items-center justify-center">
        <div className="absolute inset-x-[12%] top-[58%] h-px bg-gold/50" aria-hidden />
        <div className="absolute inset-x-[12%] top-[30%] h-px bg-plum/10" aria-hidden />
        <span className="emboss-letter relative font-display text-[clamp(8rem,20vw,15rem)] font-semibold italic leading-none">Aa</span>
      </div>
    ),
  },
  {
    id: 'ink',
    title: 'Ink',
    text: 'Deep, even colour that settles into the paper rather than sitting on it.',
    visual: (
      <div className="macro macro-paper flex h-full items-center justify-center">
        <svg viewBox="0 0 300 300" className="ink-bloom relative h-[78%]" aria-hidden>
          <defs>
            <filter id="inkfx"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="8" /><feDisplacementMap in="SourceGraphic" scale="34" /></filter>
            <radialGradient id="inkfill" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#8A55D0" /><stop offset=".55" stopColor="#402078" /><stop offset="1" stopColor="#2B1453" /></radialGradient>
          </defs>
          <circle cx="150" cy="150" r="104" fill="url(#inkfill)" filter="url(#inkfx)" opacity=".95" />
          <circle cx="150" cy="150" r="60" fill="#6A35B4" filter="url(#inkfx)" opacity=".45" />
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2
            const r = 128 + (i % 3) * 9
            return <circle key={i} cx={150 + Math.cos(a) * r} cy={150 + Math.sin(a) * r} r={2 + (i % 4)} fill="#402078" opacity=".7" />
          })}
        </svg>
      </div>
    ),
  },
  {
    id: 'finish',
    title: 'Finishing and binding',
    text: 'Clean edges, layered stock and bindings that hold — the part that makes it last.',
    visual: (
      <div className="macro h-full bg-[radial-gradient(120%_90%_at_30%_20%,#F7EEF8,#E6D9EC)]">
        <div className="absolute inset-y-[18%] left-[10%] right-[-10%] space-y-[3%]" aria-hidden>
          {['#FFFDF8', '#F3DCE3', '#C8A56A', '#FFFDF8', '#6A35B4', '#FFFDF8', '#402078'].map((c, i) => (
            <div key={i} className="h-[9%] rounded-l-md shadow-[0_8px_14px_-8px_rgba(43,20,83,.4)]" style={{ background: c, marginLeft: `${i * 3}%` }} />
          ))}
        </div>
        <div className="absolute bottom-[10%] left-[10%] right-[10%] border-t-2 border-dashed border-gold" aria-hidden />
      </div>
    ),
  },
]

export default function Craftsmanship() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="quality" aria-labelledby="quality-title" className="section relative bg-ivory">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow reveal">Craftsmanship</p>
          <h2 id="quality-title" className="reveal mt-6 font-display text-[clamp(2.8rem,6vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.015em] text-plum">
            Good Printing Is Felt <span className="italic text-violet">Before It Is Read.</span>
          </h2>
          <ol className="mt-12 hidden space-y-4 lg:block">
            {DETAILS.map((d, i) => (
              <li key={d.id} className={`flex items-center gap-4 transition-all duration-700 ease-lux ${i === active ? 'translate-x-2 text-plum' : 'text-ink-mute'}`}>
                <span className={`h-px transition-all duration-700 ease-lux ${i === active ? 'w-12 bg-gold' : 'w-6 bg-ink-mute/40'}`} />
                <span className="font-display text-2xl">{d.title}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-10 lg:space-y-16">
          {DETAILS.map((d, i) => (
            <div key={d.id} ref={(el) => (refs.current[i] = el)} data-i={i} className="reveal">
              <div className="aspect-[4/3] shadow-paper [border-radius:1.5rem]">{d.visual}</div>
              <div className="mt-5 flex gap-4 px-1">
                <span className="font-display text-xl italic text-gold-text">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-2xl font-medium text-plum">{d.title}</h3>
                  <p className="mt-1 text-ink-soft">{d.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

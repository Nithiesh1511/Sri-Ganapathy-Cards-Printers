import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { BUSINESS } from '@/data/site'

// A timeline of how a print comes together.
const STAGES = [
  { title: 'An idea', text: 'A name, an occasion, a school event — it starts with what you have in mind.' },
  { title: 'A layout', text: 'Words, logo and details find their place on the page.' },
  { title: 'Ink on paper', text: 'Business printing, invitations, offset, screen or flex.' },
  { title: 'Finishing', text: 'Binding, cutting and the details that make it complete.' },
  { title: 'In your hands', text: 'Something printed, ready to be handed over.' },
]

const COMMITMENTS = [
  { title: 'Uncompromising Quality', text: 'Exceptional materials and modern print techniques.' },
  { title: 'Competitive Value', text: 'Affordable pricing tailored to your budget.' },
  { title: 'Reliable Turnaround', text: 'Dependable, on-time delivery every single time.' },
]

/** The "Since 1995" seal: counts up when scrolled into view, with a turning text ring, orbiting spark and ripples. */
function Seal() {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0) // 0 → 1
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return setT(1)
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (now: number) => {
        const k = Math.min((now - t0) / 2200, 1)
        setT(1 - Math.pow(1 - k, 3))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div ref={ref} className="relative aspect-square" role="img" aria-label="Since 1995, more than 30 years of print">
      {/* two outline rings: a fine solid one and a dashed one that turns slowly */}
      <span className="absolute inset-4 rounded-full border border-gold/50" aria-hidden />
      <span className="seal-text absolute inset-0 rounded-full border border-dashed border-gold/70" aria-hidden />
      {/* orbiting spark */}
      <span className="seal-orbit absolute inset-4" aria-hidden>
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-gold shadow-[0_0_14px_3px_rgb(200_165_106/0.8)]" />
      </span>
      <div className="stock-plum seal-disc absolute inset-12 grid place-items-center overflow-hidden rounded-full text-center shadow-lift">
        <span className="seal-sheen" aria-hidden />
        <div className="relative">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-gold-hi">Since</p>
          <p className="foil-gold seal-foil font-display text-[4.6rem] font-semibold italic leading-none tabular-nums sm:text-[5.2rem]">{Math.round(1900 + 95 * t)}</p>
          <p className="mx-auto mt-2 h-px w-16 bg-gold/70" aria-hidden />
          <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-ivory/80 tabular-nums">{Math.round(30 * t)}+ years of print</p>
        </div>
      </div>
    </div>
  )
}

export default function BrandStory() {
  return (
    <section id="about" aria-labelledby="about-title" className="section relative overflow-hidden bg-[linear-gradient(180deg,#FFF9F0,#F8EFE2)]  !pt-14 sm:!pt-20 !pb-12 sm:!pb-16">
      <div className="wrap">
        {/* Who we are */}
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow reveal">Who we are</p>
            <h2 id="about-title" className="h-section reveal mt-5">
              Three Decades of Print, <span className="italic text-violet">Built on Trust.</span>
            </h2>
            <div className="reveal mt-8 space-y-5 text-[1.05rem] leading-relaxed text-ink-soft" style={{ '--d': '120ms' } as CSSProperties}>
              <p>
                With over three decades of hands-on experience in the printing industry, we have been delivering reliable, top-tier printing solutions to businesses and individuals since 1995.
              </p>
              <p>
                Whether you need crisp business cards, high-impact brochures and flyers, vibrant catalogues, elegant invitations, or fully customized print products, we bring your vision to life with precision and care.
              </p>
            </div>
          </div>

          {/* "Since 1995" seal */}
          <div className="reveal mx-auto w-full max-w-sm" style={{ '--d': '200ms' } as CSSProperties}>
            <Seal />
          </div>
        </div>

        {/* Our promise */}
        <div className="mt-24 lg:mt-32">
          <div className="max-w-2xl">
            <p className="eyebrow reveal">Our promise</p>
            <h3 className="h-section reveal mt-5">
              Three Commitments, <span className="italic text-violet">Every Project.</span>
            </h3>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {COMMITMENTS.map((c, i) => (
              <li key={c.title} className="reveal" style={{ '--d': `${i * 120}ms` } as CSSProperties}>
                <div className="paper h-full rounded-3xl border border-plum/10 border-t-[3px] border-t-gold p-8 shadow-paper">
                  <span className="font-display text-4xl italic text-gold-text">0{i + 1}</span>
                  <h4 className="mt-4 font-display text-[1.7rem] font-medium leading-tight text-plum">{c.title}</h4>
                  <p className="mt-3 text-ink-soft">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="stock-plum reveal relative mt-10 overflow-hidden rounded-3xl px-8 py-12 text-center shadow-lift sm:px-14" style={{ '--d': '120ms' } as CSSProperties}>
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(183_155_224/0.35),transparent_70%)]" aria-hidden />
            <p className="relative mx-auto max-w-3xl font-display text-[clamp(1.5rem,3vw,2.3rem)] italic leading-snug text-ivory">
              We don&rsquo;t just print&mdash;we build long-lasting partnerships based on trust, value, and dependable service.
            </p>
            <p className="eyebrow on-dark relative mt-6 justify-center">Your trusted printing partner for over 30 years</p>
          </div>
        </div>

        {/* How a print comes together */}
        <h3 className="reveal mt-24 font-display text-3xl font-medium text-plum lg:mt-32">
          How a print comes together at {BUSINESS.line1}
        </h3>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.title} className="fold reveal" style={{ '--d': `${i * 140}ms` } as CSSProperties}>
              <div className="paper relative rounded-t-2xl px-6 pb-4 pt-6 shadow-[0_1px_0_rgb(64_32_120/0.06)]">
                <span className="font-display text-3xl italic text-gold-text">0{i + 1}</span>
                <h4 className="mt-3 font-display text-[1.6rem] font-medium leading-tight text-plum">{s.title}</h4>
              </div>
              <div className="fold-b relative h-36 [transform-style:preserve-3d]">
                <div className="face paper rounded-b-2xl border-t border-dashed border-plum/15 px-6 py-5 shadow-paper">
                  <p className="text-[0.95rem] text-ink-soft">{s.text}</p>
                </div>
                <div className="face face-back rounded-t-2xl bg-ivory-3" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

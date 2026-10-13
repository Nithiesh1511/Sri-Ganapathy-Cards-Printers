import type { CSSProperties } from 'react'
import { BUSINESS, PROMISES } from '@/data/site'

// A timeline of how a print comes together — not a company history (the card gives
// no founding year or history, so none is claimed).
const STAGES = [
  { title: 'An idea', text: 'A name, an occasion, a school event — it starts with what you have in mind.' },
  { title: 'A layout', text: 'Words, logo and details find their place on the page.' },
  { title: 'Ink on paper', text: 'Business printing, invitations, offset, screen or flex.' },
  { title: 'Finishing', text: 'Binding, cutting and the details that make it complete.' },
  { title: 'In your hands', text: 'Something printed, ready to be handed over.' },
]

export default function BrandStory() {
  return (
    <section id="about" aria-labelledby="about-title" className="section relative overflow-hidden bg-[linear-gradient(180deg,#FFF9F0,#F8EFE2)]">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow reveal">About us</p>
            <h2 id="about-title" className="h-section reveal mt-5">
              Every Print Begins <span className="italic text-violet">with an Idea.</span>
            </h2>
          </div>
          <p className="lede reveal" style={{ '--d': '120ms' } as CSSProperties}>
            From business stationery and invitations to school printing and finished books, {BUSINESS.name} brings a wide range of printing needs together under one roof.
          </p>
        </div>

        <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.title} className="fold reveal" style={{ '--d': `${i * 140}ms` } as CSSProperties}>
              <div className="paper relative rounded-t-2xl px-6 pb-4 pt-6 shadow-[0_1px_0_rgb(64_32_120/0.06)]">
                <span className="font-display text-3xl italic text-gold-text">0{i + 1}</span>
                <h3 className="mt-3 font-display text-[1.6rem] font-medium leading-tight text-plum">{s.title}</h3>
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

        {/* The card's own three promises */}
        <ul className="mt-20 grid gap-6 border-t border-plum/10 pt-12 md:grid-cols-3">
          {PROMISES.map((p, i) => (
            <li key={p} className="reveal flex gap-4" style={{ '--d': `${i * 120}ms` } as CSSProperties}>
              <span className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" aria-hidden />
              <p className="font-display text-[1.45rem] italic leading-snug text-plum">{p}.</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

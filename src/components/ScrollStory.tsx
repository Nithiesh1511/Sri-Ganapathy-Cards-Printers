import { useRef, useState, type CSSProperties } from 'react'
import { prefersReducedMotion, setVars, useScrollScene } from '@/lib/hooks'
import { smoothstep } from '@/lib/ease'

const STEPS = [
  { title: 'A blank sheet', text: 'Every job starts here — the right paper for the piece.' },
  { title: 'Embossed detail', text: 'A raised monogram, pressed into the paper, catches the light.' },
  { title: 'Ink on paper', text: 'Rich purple flows across the page.' },
  { title: 'Type and ornament', text: 'Lettering and fine gold details take their place.' },
  { title: 'Finished, in your hands', text: 'The invitation lifts off the surface, ready for the occasion.' },
]

/** Phase windows through the pinned scroll, one per step. */
const PHASES: [number, number][] = [[0, 0.14], [0.16, 0.32], [0.34, 0.56], [0.58, 0.78], [0.8, 0.95]]

export default function ScrollStory() {
  const [reduced] = useState(prefersReducedMotion)
  const [step, setStep] = useState(reduced ? STEPS.length - 1 : 0)
  const sectionRef = useRef<HTMLElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useScrollScene(sectionRef, (p) => {
    if (reduced) return
    const a = PHASES.map(([s, e]) => smoothstep(s, e, p))
    setVars(sheetRef.current, { '--a1': a[0], '--a2': a[1], '--a3': a[2], '--a4': a[3], '--a5': a[4] })
    let s = 0
    PHASES.forEach(([start], i) => { if (p >= start + 0.02) s = i })
    setStep(s)
  })

  const done = { '--a1': 1, '--a2': 1, '--a3': 1, '--a4': 1, '--a5': 1 } as CSSProperties

  return (
    <section id="story" ref={sectionRef} aria-labelledby="story-title" className={`relative bg-ivory ${reduced ? 'section' : 'h-[340vh]'}`}>
      <div className={`${reduced ? '' : 'sticky top-0 h-[100svh]'} overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_50%,rgb(243_220_227/0.7),transparent_70%)]" aria-hidden />
        <div className="wrap relative grid h-full items-center gap-8 py-20 md:grid-cols-[1fr_1.05fr] md:py-0">
          <div className="relative z-10">
            <p className="eyebrow">The transformation</p>
            <h2 id="story-title" className="h-section mt-5">
              From blank paper <span className="italic text-violet">to beautiful print.</span>
            </h2>
            {/* Steps: all listed on larger screens; on phones only the current one shows. */}
            <ol className="mt-10 hidden space-y-1 md:block">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`flex gap-5 rounded-2xl px-4 py-3 transition-all duration-700 ease-lux ${i === step ? 'bg-white/70 shadow-paper' : 'opacity-45'}`}>
                  <span className={`mt-0.5 font-display text-xl italic ${i <= step ? 'text-gold-text' : 'text-ink-mute'}`}>0{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-plum">{s.title}</span>
                    <span className={`block overflow-hidden text-[0.93rem] text-ink-soft transition-all duration-700 ease-lux ${i === step ? 'mt-1 max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 min-h-[3.5rem] text-ink-soft md:hidden" aria-live="polite">
              <span className="mr-2 font-display text-lg italic text-gold-text">0{step + 1}</span>
              <strong className="font-semibold text-plum">{STEPS[step].title}.</strong> {STEPS[step].text}
            </p>
          </div>

          <div className="story-stage relative flex items-center justify-center">
            <div ref={sheetRef} className="story-sheet" style={reduced ? done : undefined} aria-hidden>
              <div className="story-paper">
                <div className="story-ink" />
                {/* Gold keylines */}
                <div className="story-gilt absolute inset-[5%] rounded-[3px] border border-gold/70" />
                <div className="story-gilt absolute inset-[6.6%] rounded-[2px] border border-gold/40" />

                <div className="story-type absolute inset-x-0 top-[12%] flex flex-col items-center px-[10%] text-center">
                  <span style={{ '--i': 0 } as CSSProperties} className="text-[clamp(7px,1.6vw,10px)] font-bold uppercase tracking-[0.34em] text-gold-hi">Together with their families</span>
                  <span style={{ '--i': 1 } as CSSProperties} className="mt-[6%] font-playfair text-[clamp(2rem,5.4vw,3.2rem)] italic leading-none text-ivory">Bride</span>
                  <span style={{ '--i': 1.5 } as CSSProperties} className="foil-gold my-[2%] font-playfair text-[clamp(1.6rem,4vw,2.4rem)] italic leading-none">&amp;</span>
                  <span style={{ '--i': 2 } as CSSProperties} className="font-playfair text-[clamp(2rem,5.4vw,3.2rem)] italic leading-none text-ivory">Groom</span>
                  <span style={{ '--i': 2.6 } as CSSProperties} className="mt-[16%] font-display text-[clamp(0.95rem,2.2vw,1.25rem)] italic text-ink-soft">request the pleasure of your company</span>
                  <span style={{ '--i': 3 } as CSSProperties} className="mt-[3%] h-px w-16 bg-gold" />
                </div>

                {/* Blind-embossed monogram */}
                <div className="story-emboss absolute inset-x-0 bottom-[9%] text-center font-display text-[clamp(2.4rem,6vw,3.6rem)] font-semibold italic">B&thinsp;G</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

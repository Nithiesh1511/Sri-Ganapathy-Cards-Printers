import { useRef, useState, type CSSProperties } from 'react'
import { prefersReducedMotion, setVars, useScrollScene } from '@/lib/hooks'
import { clamp01, lerp, smoothstep } from '@/lib/ease'
import CardFace from './CardFace'

/** Sheet geometry on the bed, in % of the bed's width (bed is 2.3 : 1, sheet 52% tall, 0.72 : 1). */
const SHEET_W = (52 / 2.3) * 0.72
const NIP = 50

const STEPS = ['Paper feeds in', 'The ink rollers turn', 'A printed sheet emerges', 'Ready to become anything']

function PrintedSheet() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-[#FFFDF8]">
      <div className="h-[30%] bg-gradient-to-br from-violet to-plum" />
      <div className="absolute inset-x-[12%] top-[10%] text-center">
        <div className="mx-auto h-[0.5rem] w-[40%] rounded bg-gold-hi/90" />
        <div className="mx-auto mt-[8%] h-[0.3rem] w-[60%] rounded bg-ivory/60" />
      </div>
      <div className="absolute left-1/2 top-[30%] h-[18%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-[#FFFDF8]" />
      <div className="absolute inset-x-[14%] top-[50%] space-y-[6%]">
        {[90, 76, 84, 60].map((w) => <div key={w} className="h-[0.22rem] rounded bg-plum/25" style={{ width: `${w}%` }} />)}
      </div>
      <div className="absolute bottom-[8%] left-1/2 h-px w-[30%] -translate-x-1/2 bg-gold" />
    </div>
  )
}

/** Small finished products that fan out of the printed sheet at the end. */
function Products() {
  const items = [
    { k: -1.5, rot: -14, node: <div className="aspect-[1.75] w-full overflow-hidden rounded-[4px] shadow-lift"><CardFace id="brand-front" /></div>, w: 'w-[11rem]', label: 'Visiting cards' },
    {
      k: -0.5, rot: -4, w: 'w-[7.5rem]', label: 'Invitations',
      node: (
        <div className="stock-blush relative flex aspect-[0.72] w-full flex-col items-center justify-center rounded-[4px] shadow-lift">
          <div className="keyline" />
          <span className="font-playfair text-xl italic text-plum">B &amp; G</span>
          <span className="mt-2 h-px w-8 bg-gold" />
        </div>
      ),
    },
    {
      k: 0.5, rot: 5, w: 'w-[7.5rem]', label: 'Letterheads',
      node: (
        <div className="relative aspect-[0.707] w-full rounded-[4px] bg-white p-3 shadow-lift">
          <div className="flex items-center gap-1.5 border-b border-plum/15 pb-2"><span className="h-3 w-3 rounded-full bg-violet" /><span className="h-1.5 w-12 rounded bg-plum/70" /></div>
          <div className="mt-3 space-y-2">{[90, 80, 86, 50].map((w) => <div key={w} className="h-1 rounded bg-ink/10" style={{ width: `${w}%` }} />)}</div>
        </div>
      ),
    },
    {
      k: 1.5, rot: 14, w: 'w-[8rem]', label: 'Calendars',
      node: (
        <div className="relative aspect-[0.9] w-full overflow-hidden rounded-[4px] bg-white shadow-lift">
          <div className="bg-plum py-1.5 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-ivory">{new Date().toLocaleDateString('en-IN', { month: 'long' })}</div>
          <div className="flex h-[70%] items-center justify-center font-display text-5xl text-plum">{new Date().getDate()}</div>
        </div>
      ),
    },
  ]
  return (
    <div className="press-products pointer-events-none absolute inset-x-0 bottom-[8%] top-[30%] flex items-center justify-center" aria-hidden>
      {items.map((it) => (
        <figure
          key={it.label}
          className={`absolute ${it.w} text-center`}
          style={{
            opacity: 'var(--pp, 0)',
            transform: `translate(calc(var(--pp, 0) * ${it.k} * min(13rem, 21vw)), calc((1 - var(--pp, 0)) * 3rem + ${Math.abs(it.k) * 0.6}rem)) rotate(calc(var(--pp, 0) * ${it.rot}deg)) scale(calc(0.6 + var(--pp, 0) * 0.4))`,
          }}
        >
          {it.node}
          <figcaption className="mt-3 text-[10px] font-bold uppercase tracking-[0.26em] text-ink-soft">{it.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}

export default function PrintingPress() {
  const [reduced] = useState(prefersReducedMotion)
  const [step, setStep] = useState(reduced ? 3 : 0)
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const apply = (p: number) => {
    const travel = smoothstep(0.06, 0.62, p)
    const sx = lerp(-SHEET_W * 0.4, 74, travel)
    const printed = clamp01((sx + SHEET_W - NIP) / SHEET_W)
    const lift = smoothstep(0.64, 0.78, p)
    const pp = smoothstep(0.76, 0.94, p)
    setVars(stageRef.current, {
      '--sx': `${sx.toFixed(2)}%`,
      '--roll': `${(p * 2400).toFixed(1)}px`,
      '--lift': lift,
      '--pp': pp,
      '--bed': 1 - pp,
    })
    if (printRef.current) printRef.current.style.clipPath = `inset(0 0 0 ${((1 - printed) * 100).toFixed(2)}%)`
    setStep(pp > 0.3 ? 3 : printed > 0.98 ? 2 : travel > 0.12 ? 1 : 0)
  }

  useScrollScene(sectionRef, (p) => { if (!reduced) apply(p) })

  const finalVars = { '--sx': '74%', '--lift': 1, '--pp': 1, '--bed': 0 } as CSSProperties

  return (
    <section id="craft" ref={sectionRef} aria-labelledby="craft-title" className={`relative bg-gradient-to-b from-ivory via-ivory-2 to-ivory ${reduced ? 'section' : 'h-[320vh]'}`}>
      <div ref={stageRef} className={`${reduced ? 'relative min-h-[48rem]' : 'sticky top-0 h-[100svh]'} overflow-hidden`} style={reduced ? finalVars : undefined}>
        <div className="wrap relative z-10 pt-24 sm:pt-28">
          <p className="eyebrow">Our craft</p>
          <h2 id="craft-title" className="h-section mt-4 max-w-[40rem]">
            Paper in. <span className="italic text-violet">Beautiful print out.</span>
          </h2>
        </div>

        <div className="press-stage absolute inset-x-0 bottom-[8%] top-[30%] flex items-center justify-center" aria-hidden>
          <div className="press-bed" style={{ opacity: 'var(--bed, 1)', transition: 'opacity .3s' }}>
            <div className="press-track" />
            {/* The feed stack waiting on the left */}
            {[2, 1].map((k) => (
              <div key={k} className="press-sheet bg-[#FFFDF8]" style={{ left: `${-SHEET_W * 0.4 - k * 0.6}%`, transform: `translateZ(${-k}px)` }} />
            ))}
            <div className="press-sheet">
              <div className="absolute inset-0 rounded-[3px] bg-[#FFFDF8]" />
              <div ref={printRef} className="absolute inset-0" style={{ clipPath: reduced ? 'none' : 'inset(0 0 0 100%)' }}>
                <PrintedSheet />
              </div>
            </div>
            <div className="press-frame press-frame-far" />
            <div className="press-roller" style={{ '--x': '46%', '--w': '8%', '--z': '34px', '--c1': '#1D0E38', '--c2': '#6A35B4', '--c3': '#9C74DA' } as CSSProperties} />
            <div className="press-roller" style={{ '--x': '41.5%', '--w': '4%', '--z': '62px', '--c1': '#2B1453', '--c2': '#7A48C4', '--c3': '#B79BE0' } as CSSProperties} />
            <div className="press-roller" style={{ '--x': '54.5%', '--w': '4%', '--z': '62px', '--c1': '#2B1453', '--c2': '#7A48C4', '--c3': '#B79BE0' } as CSSProperties} />
            <div className="press-frame press-frame-near" />
          </div>
        </div>

        <Products />

        <ol className="wrap absolute inset-x-0 bottom-24 z-10 lg:bottom-10 flex flex-wrap justify-center gap-x-8 gap-y-2 sm:bottom-10">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-2.5 text-[0.82rem] font-semibold transition-all duration-700 ease-lux ${i === step ? 'text-plum' : 'text-ink-mute/70'} ${i === step ? '' : 'max-sm:hidden'}`}>
              <span className={`h-1.5 rounded-full transition-all duration-700 ease-lux ${i === step ? 'w-6 bg-gold' : 'w-1.5 bg-ink-mute/40'}`} />
              {s}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { BUSINESS } from '@/data/site'
import { hasWebGL, prefersReducedMotion, useRunwayProgress } from '@/lib/hooks'
import { smoothstep } from '@/lib/ease'
import { endIntro, IntroRun, introWanted, LOCKED } from '@/lib/intro'
import type { HeroProgress } from '@/three/HeroScene'
import { PinwheelMark } from './Logo'
import { Arrow, ArrowDown, Phone } from './Icons'

// three.js is the heaviest thing on the page: fetched on its own, after first paint.
const HeroCanvas = lazy(() => import('./HeroCanvas'))

const PLATES = [
  { key: 'C', name: 'Cyan', cls: 'bg-cy' },
  { key: 'M', name: 'Magenta', cls: 'bg-mg' },
  { key: 'Y', name: 'Yellow', cls: 'bg-ye' },
  { key: 'K', name: 'Key', cls: 'bg-ink' },
]

/**
 * The hero is a tall "runway" with a sticky one-screen stage. Scrolling down the
 * runway slides four translucent ink plates together in 3D until they register
 * into a finished visiting card — the way every print is really made.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const stampRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const capRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLParagraphElement>(null)
  const capLabelRef = useRef<HTMLSpanElement>(null)
  const capPctRef = useRef<HTMLSpanElement>(null)
  const capBarRef = useRef<HTMLElement>(null)
  const raw = useRunwayProgress(sectionRef)
  const progress = useMemo<HeroProgress>(() => ({ raw: 0, smooth: 0, center: 0 }), [])
  const [glOk, setGlOk] = useState(() => hasWebGL())
  const reduced = useMemo(prefersReducedMotion, [])

  // The opening sequence (first visit of a session): index.html has already hidden the page chrome.
  const intro = useMemo(() => {
    if (!introWanted()) return null
    if (reduced || !hasWebGL()) { endIntro(); return null }
    progress.center = 1
    return new IntroRun()
  }, [reduced, progress])

  // While it plays, any input skips it. Scroll is locked (in CSS) so we always start at the top.
  useEffect(() => {
    if (!intro) return
    window.scrollTo(0, 0)
    const skip = () => intro.skip()
    const opts = { passive: true } as const
    window.addEventListener('pointerdown', skip, opts)
    window.addEventListener('keydown', skip, opts)
    window.addEventListener('wheel', skip, opts)
    window.addEventListener('touchstart', skip, opts)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
    }
  }, [intro])

  // One small loop feeds the scene and mirrors its state into the DOM (no re-renders).
  useEffect(() => {
    let id = 0
    let lastLabel = ''
    const update = () => {
      const scrollRaw = reduced ? 1 : raw.current ?? 0
      if (intro && intro.phase !== 'done') {
        // The scene never appeared (no WebGL after all, or the context was lost): just open the page.
        if (!glOk) intro.skip()
        const f = intro.step(performance.now(), scrollRaw, progress.smooth)
        if (f.phase === 'done') {
          endIntro()
          progress.center = 0
          progress.raw = scrollRaw
        } else {
          progress.raw = f.raw
          progress.center = f.center
        }
        if (loaderRef.current) loaderRef.current.style.opacity = f.phase === 'load' ? '1' : '0'
        if (skipRef.current) skipRef.current.style.opacity = (f.cap * 0.9).toFixed(3)
        if (capRef.current) {
          capRef.current.style.opacity = f.cap.toFixed(3)
          // "Registered" only once the plates have actually locked on screen.
          const label = progress.smooth >= LOCKED ? 'Registered' : 'Registering the plates'
          if (label !== lastLabel) {
            lastLabel = label
            if (capLabelRef.current) capLabelRef.current.textContent = label
          }
          const pct = progress.smooth >= LOCKED ? 100 : Math.min(99, Math.round(progress.smooth * 100))
          if (capPctRef.current) capPctRef.current.textContent = String(pct).padStart(3, '0')
          if (capBarRef.current) capBarRef.current.style.transform = `scaleX(${progress.smooth.toFixed(3)})`
        }
      } else {
        progress.raw = scrollRaw
      }
      // Without the WebGL scene to smooth it, follow scroll directly.
      if (!glOk) progress.smooth = progress.raw
      const p = progress.smooth
      const reg = 1 - smoothstep(0.7, 0.97, p)
      sectionRef.current?.style.setProperty('--reg', reg.toFixed(3))
      if (readoutRef.current) readoutRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(3)})`
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smoothstep(0, 0.1, p))
      if (stampRef.current) {
        const on = smoothstep(0.93, 0.99, p)
        stampRef.current.style.opacity = on.toFixed(3)
        stampRef.current.style.transform = `translateY(${((1 - on) * 14).toFixed(1)}px)`
      }
    }
    const tick = () => { id = requestAnimationFrame(tick); update() }
    tick()
    return () => cancelAnimationFrame(id)
  }, [raw, progress, glOk, reduced, intro])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? '100svh' : '260vh', minHeight: reduced ? 520 : undefined }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[520px] overflow-hidden bg-paper">
        {glOk ? (
          <Suspense fallback={null}>
            <HeroCanvas progress={progress} onFailure={() => setGlOk(false)} onReady={() => intro?.ready()} />
          </Suspense>
        ) : (
          <FlatCard />
        )}

        {/* A fine gilt frame round the stage, like the keyline on a proof. */}
        <div aria-hidden className="pointer-events-none absolute inset-3 z-[5] border border-gold/25 sm:inset-5">
          {['-left-[3.5px] -top-[3.5px]', '-right-[3.5px] -top-[3.5px]', '-bottom-[3.5px] -left-[3.5px]', '-bottom-[3.5px] -right-[3.5px]'].map((pos) => (
            <i key={pos} className={`absolute ${pos} h-[7px] w-[7px] rotate-45 bg-gold`} />
          ))}
        </div>

        {/* The opening sequence's own furniture: a loader until the 3D scene is ready, then a progress caption. */}
        {intro && (
          <>
            <div ref={loaderRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 grid place-items-center transition-opacity duration-700">
              <div className="flex flex-col items-center gap-5">
                <PinwheelMark size={56} className="animate-[spin_6s_linear_infinite]" />
                <span className="block h-px w-32 overflow-hidden bg-gold/25"><i className="hero-loader__bar block h-full w-1/2 bg-gold" /></span>
              </div>
            </div>
            <div ref={capRef} aria-hidden className="pointer-events-none absolute inset-x-0 top-[6%] z-20 flex flex-col items-center gap-2 text-center" style={{ opacity: 0 }}>
              <span ref={capLabelRef} className="eyebrow eyebrow--plain">Registering the plates</span>
              <span className="font-display text-[2.6rem] italic leading-none sm:text-[3.6rem]">
                <span ref={capPctRef} className="foil-text">000</span>
                <span className="foil-text text-[0.5em]">%</span>
              </span>
              <span className="mt-1 block h-px w-44 overflow-hidden bg-ink/15">
                <i ref={capBarRef} className="block h-[3px] origin-left -translate-y-px bg-gradient-to-r from-gold-lo via-gold-hi to-gold" style={{ transform: 'scaleX(0)' }} />
              </span>
            </div>
            <p ref={skipRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-6 z-20 text-center font-sans text-[9px] font-bold uppercase tracking-[0.34em] text-ink-mute sm:bottom-8" style={{ opacity: 0 }}>
              Tap or press any key to skip
            </p>
          </>
        )}

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="container-x relative flex h-full flex-col justify-start pb-28 pt-28 sm:pt-32 mdl:justify-center mdl:pb-16 mdl:pt-20 lg:justify-center lg:pb-16 lg:pt-20">
            <div className="hero-copy pointer-events-auto max-w-[38rem] mdl:max-w-[26rem] lg:max-w-[38rem]">
              <p className="eyebrow mb-6 leading-[1.7]">School · Invitation · Business printing</p>
              <h1 className="text-balance font-display text-[2.7rem] font-normal leading-[0.98] text-ink xs:text-[3.5rem] sm:text-[4.7rem] mdl:text-[3.4rem] lg:text-[5.4rem]">
                Four inks.
                <br />
                <span className="ghost inline-block">
                  <span className="foil-text italic">One perfect</span>
                </span>{' '}
                print.
              </h1>
              <p className="mt-5 max-w-[30rem] text-[15px] leading-relaxed text-ink-soft sm:hidden">
                School printing, invitations and complete business printing.
              </p>
              <p className="mt-7 hidden max-w-[29rem] text-[17px] font-light leading-[1.75] text-ink-soft sm:block mdl:text-[15px] [@media(max-height:620px)]:!hidden">
                {BUSINESS.name} handles all your school printing, invitations for every occasion and a complete range of
                business printing — from visiting cards to diaries.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
                <a href="#showroom" className="btn btn-gold">
                  See what we print <Arrow width={16} />
                </a>
                <a href={`tel:${BUSINESS.phones[0].tel}`} className="btn btn-ghost hidden xs:inline-flex">
                  <Phone width={16} /> {BUSINESS.phones[0].display}
                </a>
              </div>
              <div ref={hintRef} className="mt-10 hidden items-center gap-3 font-sans text-[10px] font-bold uppercase tracking-[0.34em] text-ink-mute lg:flex [@media(max-height:620px)]:!hidden">
                <ArrowDown width={14} className="animate-bounce text-gold" />
                Scroll to register the plates
              </div>
            </div>
          </div>

          {/* A slowly turning seal, set just below the nav. */}
          <div aria-hidden className="hero-fade absolute right-[4%] top-[17%] hidden text-gold-text lg:block xl:right-[6%]">
            <Seal />
          </div>

          {/* Plate legend + live registration readout */}
          <div className="hero-fade absolute inset-x-0 bottom-0">
            <div className="container-x flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-8 sm:pb-10">
              <div className="flex items-center gap-4">
                <ul className="flex items-center gap-1.5" aria-label="The four process inks">
                  {PLATES.map((pl) => (
                    <li key={pl.key} className="flex items-center gap-1.5 rounded-full border border-gold/35 bg-paper/60 py-1 pl-1.5 pr-2.5 backdrop-blur">
                      <i className={`block h-3 w-3 rounded-full ${pl.cls}`} />
                      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-ink-soft">{pl.key}</span>
                    </li>
                  ))}
                </ul>
                <div ref={stampRef} className="hidden items-center gap-2.5 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gold-text sm:flex" style={{ opacity: 0 }}>
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-gold text-[10px]">✓</span>
                  Registered
                </div>
              </div>

              <div className="w-full min-w-[15rem] max-w-[17rem] sm:w-auto">
                <div className="mb-2 flex items-center justify-between font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-ink-mute">
                  <span>Registration</span>
                  <span className="text-gold-text"><span ref={readoutRef}>000</span>%</span>
                </div>
                <div className="h-px overflow-hidden bg-ink/15">
                  <div ref={barRef} className="h-[3px] origin-left -translate-y-px bg-gradient-to-r from-gold-lo via-gold-hi to-gold" style={{ transform: 'scaleX(0)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Lettering set round a circle, turning slowly, with the mark at its centre. */
function Seal() {
  return (
    <div className="relative h-[7.6rem] w-[7.6rem]">
      <svg viewBox="0 0 120 120" className="absolute inset-0 animate-[spin_46s_linear_infinite]" aria-hidden>
        <defs>
          <path id="sealpath" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeOpacity="0.35" />
        <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeOpacity="0.25" />
        <text fill="currentColor" fontSize="8.4" fontWeight="700" fontFamily="Manrope, sans-serif">
          <textPath href="#sealpath" textLength="290" lengthAdjust="spacing">SCHOOL · INVITATIONS · BUSINESS · PRINTING · </textPath>
        </text>
      </svg>
      <PinwheelMark size={44} className="absolute inset-0 m-auto" />
    </div>
  )
}

/** Shown only if the browser can't do WebGL: the same card, flat. */
function FlatCard() {
  return (
    <div className="absolute inset-0 grid place-items-center lg:pl-[40%]">
      <div className="panel mt-44 w-[min(86vw,34rem)] p-7 lg:mt-0">
        <div className="flex items-center gap-4">
          <PinwheelMark size={84} />
          <div>
            <p className="foil-text font-display text-3xl italic">{BUSINESS.line1}</p>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.34em] text-ink-soft">{BUSINESS.line2}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-5 font-sans text-sm font-bold text-ink">
          {BUSINESS.phones.map((p) => <span key={p.tel}>{p.display}</span>)}
        </div>
      </div>
    </div>
  )
}

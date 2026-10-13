import { lazy, Suspense, useMemo, useRef, useState, type CSSProperties } from 'react'
import { hasWebGL, prefersReducedMotion, setVars, useScrollScene } from '@/lib/hooks'
import { smoothstep } from '@/lib/ease'
import type { HeroProgress } from '@/three/HeroScene'
import { Arrow } from './Icons'
import CardStackCSS from './CardStackCSS'

const HeroCanvas = lazy(() => import('./HeroCanvas'))

/** The full 3D scroll scene runs on tablets and up, with motion allowed and WebGL present. */
function wants3D(): boolean {
  return matchMedia('(min-width: 768px)').matches && !prefersReducedMotion() && hasWebGL()
}

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export default function HeroSection() {
  const [use3D, setUse3D] = useState(wants3D)
  const progress = useMemo<HeroProgress>(() => ({ current: 0 }), [])
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLAnchorElement>(null)

  useScrollScene(sectionRef, (p) => {
    progress.current = p
    if (!use3D) return
    // The headline steps back as the cards come forward; a caption takes its place.
    const out = smoothstep(0.04, 0.3, p)
    setVars(cueRef.current, { opacity: 1 - smoothstep(0, 0.06, p) })
    setVars(textRef.current, { opacity: 1 - out, '--ty': `${(-out * 60).toFixed(1)}px`, visibility: out > 0.99 ? 'hidden' : 'visible' })
    const cap = smoothstep(0.66, 0.9, p)
    setVars(captionRef.current, { opacity: cap, '--ty': `${((1 - cap) * 30).toFixed(1)}px`, visibility: cap < 0.01 ? 'hidden' : 'visible' })
  })

  return (
    <section id="home" ref={sectionRef} aria-label="Introduction" className={`hero-atmos relative ${use3D ? 'h-[260vh]' : ''}`}>
      <div className={`${use3D ? 'sticky top-0 h-[100svh]' : 'relative min-h-[100svh]'} overflow-hidden`}>
        {use3D && (
          <Suspense fallback={null}>
            <HeroCanvas progress={progress} onFailure={() => setUse3D(false)} />
          </Suspense>
        )}

        <div className="wrap relative flex h-full min-h-[100svh] flex-col justify-center pb-16 pt-28 md:max-lg:justify-start md:max-lg:pt-36">
          <div
            ref={textRef}
            className="relative z-10 max-w-[38rem] md:max-lg:mx-auto md:max-lg:text-center"
            style={{ transform: 'translateY(var(--ty, 0px))' }}
          >
            <p className="eyebrow rise !tracking-[0.22em] md:max-lg:justify-center" style={d(100)}>
              Crafted with precision · Printed with passion
            </p>
            <h1 className="h-display rise mt-6 !text-[clamp(3rem,7.2vw,6.3rem)]" style={d(220)}>
              Your Ideas.
              <span className="block italic text-violet">Beautifully Printed.</span>
            </h1>
            <p className="lede rise mt-7 md:max-lg:mx-auto" style={d(380)}>
              From memorable invitations to premium business stationery, we turn your ideas into exceptional print experiences.
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3 md:max-lg:justify-center" style={d(520)}>
              <a href="#services" className="btn btn-primary">
                Explore Our Craft <Arrow width={18} />
              </a>
              <a href="#contact" className="btn btn-outline">Request a Quote</a>
            </div>
          </div>

          {!use3D && (
            <CardStackCSS className="rise mx-auto mt-6 h-[min(80vw,22rem)] w-full max-w-[28rem] md:absolute md:bottom-[6%] md:left-1/2 md:mt-0 md:h-[24rem] md:w-[32rem] md:max-w-none md:-translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-10 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0" />
          )}

          {use3D && (
            <div
              ref={captionRef}
              className="pointer-events-none absolute inset-x-0 bottom-[11vh] z-10 px-6 text-center"
              style={{ opacity: 0, visibility: 'hidden', transform: 'translateY(var(--ty, 30px))' }}
            >
              <p className="eyebrow justify-center">Every kind of print</p>
              <p className="mt-4 font-display text-[clamp(2rem,4vw,3.4rem)] italic leading-tight text-plum">
                Cards. Invitations. Stationery. And everything after.
              </p>
            </div>
          )}

          <a
            ref={cueRef}
            href="#story"
            className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ink-mute lg:flex"
          >
            Scroll
            <span className="scroll-line" />
          </a>
        </div>
      </div>
    </section>
  )
}

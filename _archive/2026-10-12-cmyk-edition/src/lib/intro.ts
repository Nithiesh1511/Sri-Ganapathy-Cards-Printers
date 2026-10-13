// The opening sequence: on the first visit of a session the hero scene plays itself —
// the four ink plates slide into register and print the shop's card — holds on the
// finished card, then eases open into the normal, scroll-driven hero.
//
// index.html sets <html data-intro="on"> before first paint (first visit, motion allowed).
// Hero runs this controller, flips the attribute to "out" as the page opens up (CSS fades the
// nav and copy in), and removes it when done. Scrolling is locked while it is set.

import { clamp01, lerp, smoothstep, easeInOutQuad, easeInOutCubic } from './ease'

export const INTRO_KEY = 'sgc-intro-seen'

const REGISTER_MS = 3000 // plates slide into register
const HOLD_MS = 1000 // the finished card, with the foil sweep
const RELEASE_MS = 1700 // the card eases off to the side and the plates part again
const GIVE_UP_MS = 6500 // never make a visitor wait on a slow 3D download
const LOCK_WAIT_MS = 3500 // …nor on a scene that is slow to settle
/** The scene counts the plates as locked once its progress passes this. */
export const LOCKED = 0.985

export type IntroPhase = 'load' | 'register' | 'hold' | 'release' | 'done'

export interface IntroFrame {
  phase: IntroPhase
  /** Registration progress to feed the scene (0 = plates apart, 1 = in register). */
  raw: number
  /** 1 = card centred on screen, 0 = in its normal place beside the copy. */
  center: number
  /** Opacity of the progress caption. */
  cap: number
}

const root = () => document.documentElement

export const introWanted = () => root().dataset.intro === 'on'

export function endIntro() {
  root().removeAttribute('data-intro')
  try { sessionStorage.setItem(INTRO_KEY, '1') } catch { /* storage blocked: it just plays again next time */ }
}

export class IntroRun {
  phase: IntroPhase = 'load'
  private born = performance.now()
  private since = 0
  private holdBegan = 0
  private value = 0
  private from = 0
  private readonly frame: IntroFrame = { phase: 'load', raw: 0, center: 1, cap: 0 }

  /** The scene has painted and its fonts have arrived: start the show. */
  ready() {
    if (this.phase !== 'load') return
    this.phase = 'register'
    this.since = performance.now()
  }

  /** Any input ends the show early (straight to the page if the scene never appeared). */
  skip() {
    if (this.phase === 'load') this.phase = 'done'
    else if (this.phase === 'register' || this.phase === 'hold') this.release(performance.now())
  }

  private release(now: number) {
    this.phase = 'release'
    this.since = now
    this.from = this.value
    root().setAttribute('data-intro', 'out')
  }

  /**
   * `smooth` is the scene's own (eased) progress. The hold is timed from the moment the plates
   * have really locked, so a slow device that lags behind the clock still gets its full beat.
   */
  step(now: number, scrollRaw: number, smooth: number): IntroFrame {
    const f = this.frame
    switch (this.phase) {
      case 'load':
        if (now - this.born > GIVE_UP_MS) this.phase = 'done'
        f.raw = 0; f.center = 1; f.cap = 0
        break
      case 'register': {
        const u = clamp01((now - this.since) / REGISTER_MS)
        this.value = easeInOutQuad(u)
        f.raw = this.value; f.center = 1; f.cap = smoothstep(0, 0.12, u)
        if (u >= 1) { this.phase = 'hold'; this.since = now; this.holdBegan = now }
        break
      }
      case 'hold':
        this.value = 1
        f.raw = 1; f.center = 1; f.cap = 1
        // Wait for the lock (but never more than a few seconds), then hold the beat.
        if (smooth < LOCKED && now - this.holdBegan < LOCK_WAIT_MS) this.since = now
        if (now - this.since >= HOLD_MS) this.release(now)
        break
      case 'release': {
        const u = clamp01((now - this.since) / RELEASE_MS)
        const k = easeInOutCubic(u)
        f.raw = lerp(this.from, scrollRaw, k); f.center = 1 - k; f.cap = 1 - smoothstep(0, 0.3, u)
        if (u >= 1) this.phase = 'done'
        break
      }
      case 'done':
        f.raw = scrollRaw; f.center = 0; f.cap = 0
        break
    }
    f.phase = this.phase
    return f
  }
}

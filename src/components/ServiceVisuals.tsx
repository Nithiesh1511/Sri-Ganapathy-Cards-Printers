import type { CSSProperties, ReactElement } from 'react'
import type { GalleryId } from '@/data/services'
import CardFace from './CardFace'

// Each visual is pure CSS 3D, sized in container units (cqw) so it scales with its
// card. Hover / focus / "open" sets --o from 0 to 1 on the .viz wrapper (see index.css);
// every moving part below reads that one number.

const v = (vars: Record<string, string | number>) => vars as CSSProperties

function VisitingCards() {
  return (
    <div className="vz-center vc-stack">
      <div className="vc vc-1"><div className="face"><CardFace id="minimal-front" /></div></div>
      <div className="vc vc-2"><div className="face"><CardFace id="invite-front" /></div></div>
      <div className="vc vc-3">
        <div className="face"><CardFace id="brand-front" /></div>
        <div className="face face-back"><CardFace id="brand-back" /></div>
      </div>
    </div>
  )
}

function Invitation() {
  return (
    <div className="vz-center inv">
      <div className="inv-envelope" />
      <div className="inv-inner stock-ivory flex flex-col items-center justify-center overflow-hidden text-center">
        <div className="keyline" />
        <span className="text-[1.5cqw] font-bold uppercase tracking-[0.3em] text-gold-text">You are invited</span>
        <span className="mt-[3cqw] font-playfair text-[6cqw] italic leading-none text-plum">Ananya</span>
        <span className="foil-gold font-playfair text-[5cqw] italic leading-tight">&amp;</span>
        <span className="font-playfair text-[6cqw] italic leading-none text-plum">Karthik</span>
        <span className="mt-[3cqw] h-px w-[10cqw] bg-gold" />
        <span className="mt-[2cqw] font-display text-[2.3cqw] italic text-ink-soft">to celebrate with us</span>
      </div>
      {(['l', 'r'] as const).map((side) => (
        <div key={side} className={`inv-door inv-door-${side}`}>
          <div className="face stock-blush">
            <div className={`absolute inset-y-[5%] ${side === 'l' ? 'left-[10%] right-0 border-r-0' : 'left-0 right-[10%] border-l-0'} border border-gold/70`} />
            <div className={`absolute top-1/2 h-[30%] w-[30%] -translate-y-1/2 rounded-full border border-gold/60 ${side === 'l' ? 'right-[-15%]' : 'left-[-15%]'}`} />
          </div>
          <div className="face face-back stock-ivory" />
        </div>
      ))}
      <div className="inv-seal flex items-center justify-center font-display text-[4.6cqw] italic text-gold-hi">A&thinsp;K</div>
    </div>
  )
}

function Letterheads() {
  return (
    <div className="vz-center lh-set">
      {[0, 1, 2].map((i) => (
        <div key={i} className="lh-sheet" style={v({ '--i': i })}>
          <div className="absolute inset-x-[9%] top-[7%] flex items-center gap-[1.2cqw] border-b border-plum/15 pb-[1.4cqw]">
            <span className="h-[3.4cqw] w-[3.4cqw] rounded-full bg-gradient-to-br from-violet to-plum" />
            <span className="flex-1">
              <span className="block h-[1.1cqw] w-[60%] rounded bg-plum/80" />
              <span className="mt-[0.7cqw] block h-[0.6cqw] w-[38%] rounded bg-gold/70" />
            </span>
          </div>
          <div className="absolute inset-x-[9%] top-[24%] space-y-[1.3cqw]">
            {Array.from({ length: 9 }, (_, k) => (
              <span key={k} className="block h-[0.45cqw] rounded bg-ink/10" style={{ width: `${k === 8 ? 40 : 92 - (k % 3) * 9}%` }} />
            ))}
          </div>
          <span className="absolute bottom-[6%] left-[9%] right-[9%] h-[0.5cqw] rounded bg-gold/60" />
        </div>
      ))}
      <div className="lh-bill overflow-hidden">
        <div className="flex items-center justify-between bg-plum px-[1.6cqw] py-[1.2cqw] text-ivory">
          <span className="text-[1.7cqw] font-bold tracking-[0.2em]">BILL</span>
          <span className="text-[1.4cqw] text-gold-hi">No. 0427</span>
        </div>
        <div className="space-y-[1.3cqw] px-[1.6cqw] pt-[1.6cqw]">
          {Array.from({ length: 6 }, (_, k) => (
            <span key={k} className="flex justify-between border-b border-dashed border-plum/20 pb-[0.6cqw]">
              <span className="h-[0.5cqw] w-[50%] rounded bg-ink/15" />
              <span className="h-[0.5cqw] w-[18%] rounded bg-ink/15" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SealSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <path id="seal-ring" d="M60 60 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0" />
      </defs>
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text fontSize="11.5" fontWeight="700" letterSpacing="2.4" fill="currentColor" fontFamily="Manrope, sans-serif">
        <textPath href="#seal-ring">YOUR NAME • YOUR SEAL • YOUR NAME •</textPath>
      </text>
      <path d="M60 44l4.6 10.4 11.4 1.1-8.6 7.6 2.5 11.1L60 68.4l-9.9 5.8 2.5-11.1-8.6-7.6 11.4-1.1Z" fill="currentColor" />
    </svg>
  )
}

function IdStamps() {
  return (
    <>
      <div className="id-card overflow-hidden bg-white">
        <div className="absolute left-1/2 top-[3%] h-[4%] w-[22%] -translate-x-1/2 rounded-full bg-ivory-3" />
        <div className="h-[24%] bg-gradient-to-br from-violet to-plum px-[2cqw] pt-[3.4cqw] text-center text-[1.6cqw] font-bold uppercase tracking-[0.2em] text-ivory">Identity card</div>
        <div className="mx-auto -mt-[4cqw] h-[11cqw] w-[11cqw] overflow-hidden rounded-full border-[0.6cqw] border-white bg-blush">
          <div className="mx-auto mt-[2.2cqw] h-[4cqw] w-[4cqw] rounded-full bg-violet-soft" />
          <div className="mx-auto mt-[0.6cqw] h-[6cqw] w-[8cqw] rounded-t-full bg-violet-soft" />
        </div>
        <div className="mt-[2cqw] space-y-[1cqw] px-[2.6cqw]">
          <span className="mx-auto block h-[1.1cqw] w-[70%] rounded bg-plum/80" />
          <span className="mx-auto block h-[0.6cqw] w-[45%] rounded bg-gold/80" />
          <span className="block h-[0.5cqw] w-full rounded bg-ink/10" />
          <span className="block h-[0.5cqw] w-[80%] rounded bg-ink/10" />
        </div>
      </div>
      <div className="stamp-paper">
        <SealSVG className="stamp-impr absolute left-1/2 top-1/2 -ml-[9cqw] -mt-[9cqw] h-[18cqw] w-[18cqw] text-violet" />
      </div>
      <svg viewBox="0 0 100 120" className="stamp" aria-hidden>
        <defs>
          <linearGradient id="knob" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7A48C4" /><stop offset="1" stopColor="#2B1453" /></linearGradient>
          <linearGradient id="base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A3824A" /><stop offset=".5" stopColor="#E8D3A6" /><stop offset="1" stopColor="#A3824A" /></linearGradient>
        </defs>
        <ellipse cx="50" cy="22" rx="20" ry="19" fill="url(#knob)" />
        <rect x="42" y="36" width="16" height="34" rx="5" fill="url(#knob)" />
        <rect x="14" y="68" width="72" height="22" rx="5" fill="url(#base)" />
        <rect x="18" y="90" width="64" height="8" rx="2" fill="#211D28" />
      </svg>
    </>
  )
}

function OffsetScreenFlex() {
  const SW = ['#402078', '#6A35B4', '#E7C2CF', '#C8A56A', '#211D28']
  return (
    <>
      <div className="swatch-fan">
        {SW.map((c, i) => (
          <div key={c} className="swatch overflow-hidden" style={v({ '--i': i })}>
            <div className="h-[72%]" style={{ background: c }} />
            <div className="space-y-[0.6cqw] p-[0.9cqw]">
              <span className="block h-[0.5cqw] w-[70%] rounded bg-ink/30" />
              <span className="block h-[0.4cqw] w-[45%] rounded bg-ink/15" />
            </div>
          </div>
        ))}
      </div>
      <div className="vz-center reg-poster">
        <div className="reg-layer reg-base" style={v({ '--dx': '0cqw', '--dy': '0cqw', '--dz': '0cqw' })} />
        <div className="reg-layer" style={v({ '--dx': '-7cqw', '--dy': '-4cqw', '--dz': '5cqw' })}>
          <div className="absolute left-[14%] top-[10%] h-[52%] w-[72%] rounded-full bg-blush-deep/90" />
        </div>
        <div className="reg-layer" style={v({ '--dx': '6cqw', '--dy': '-6cqw', '--dz': '10cqw' })}>
          <div className="absolute bottom-[34%] left-[22%] right-[22%] top-[22%] rounded-t-full border-[1.6cqw] border-b-0 border-violet/80" />
        </div>
        <div className="reg-layer" style={v({ '--dx': '-4cqw', '--dy': '7cqw', '--dz': '15cqw' })}>
          <div className="absolute inset-x-0 bottom-[10%] text-center">
            <div className="font-display text-[6.4cqw] italic leading-none text-plum">Print</div>
            <div className="mt-[0.6cqw] text-[1.2cqw] font-bold uppercase tracking-[0.34em] text-ink-soft">Offset · Screen · Flex</div>
          </div>
        </div>
        <div className="reg-layer" style={v({ '--dx': '8cqw', '--dy': '5cqw', '--dz': '20cqw' })}>
          <div className="absolute inset-[5%] rounded-[0.3cqw] border border-gold" />
        </div>
      </div>
      <div className="flex-banner flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-plum to-plum-deep text-center">
        <div className="absolute inset-[6%] border border-gold/60" />
        {[['left-[3%]', 'top-[6%]'], ['right-[3%]', 'top-[6%]'], ['left-[3%]', 'bottom-[6%]'], ['right-[3%]', 'bottom-[6%]']].map(([x, y]) => (
          <span key={x + y} className={`absolute ${x} ${y} h-[1cqw] w-[1cqw] rounded-full bg-gold-hi`} />
        ))}
        <span className="text-[1.1cqw] font-bold uppercase tracking-[0.3em] text-gold-hi">Flex banner</span>
        <span className="mt-[0.5cqw] font-display text-[3.4cqw] italic leading-none text-ivory">Your message</span>
      </div>
    </>
  )
}

function Binding() {
  const PAGES = [-128, -100, -72, -44]
  return (
    <>
      <div className="book overflow-hidden" style={{ background: 'linear-gradient(180deg,#4E2690,#2B1453)' }}>
        <span className="absolute inset-y-0 left-[12%] w-[1.2cqw] bg-gradient-to-r from-gold-lo via-gold-hi to-gold-lo" />
        <span className="absolute inset-y-0 right-[12%] w-[1.2cqw] bg-gradient-to-r from-gold-lo via-gold-hi to-gold-lo" />
        <span className="absolute inset-0 flex items-center justify-center text-[1.5cqw] font-bold uppercase tracking-[0.4em] text-gold-hi">Rexin bound</span>
      </div>
      <div className="vz-center nb">
        <div className="nb-back" />
        {PAGES.map((a, i) => (
          <div key={a} className="nb-page" style={v({ '--i': i + 1, '--a': `${a}deg` })} />
        ))}
        <div className="nb-cover">
          <div className="face stock-plum">
            <div className="absolute inset-[7%] rounded-[0.4cqw] border border-gold/50" />
            <div className="absolute inset-x-[16%] top-[38%] rounded-[0.4cqw] bg-ivory/95 px-[2cqw] py-[1.6cqw] text-center">
              <span className="block font-display text-[3.6cqw] italic leading-none text-plum">Notes</span>
              <span className="mt-[1cqw] block h-px bg-gold" />
            </div>
          </div>
          <div className="face face-back" style={{ background: 'linear-gradient(90deg,#EFE3D1,#FFFDF8)' }} />
        </div>
        <div className="nb-rings">
          {Array.from({ length: 11 }, (_, i) => <i key={i} />)}
        </div>
      </div>
    </>
  )
}

function PaperCharts() {
  const STOCK = ['#C9DCCB', '#C3D5E8', '#F3E2A6', '#E7C2CF', '#B79BE0', '#EFE3D1']
  return (
    <div className="vz-center fan">
      {STOCK.map((c, i) => (
        <div key={c} className="fan-sheet" style={v({ '--i': i, background: c })} />
      ))}
      <div className="fan-sheet overflow-hidden" style={v({ '--i': STOCK.length, background: '#FFFDF8' })}>
        <div className="absolute inset-[8%] bg-[linear-gradient(rgb(64_32_120/0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(64_32_120/0.08)_1px,transparent_1px)] bg-[size:3cqw_3cqw]" />
        <span className="absolute left-[10%] top-[10%] h-[1.2cqw] w-[40%] rounded bg-plum/80" />
        <div className="absolute bottom-[12%] left-[12%] right-[12%] flex h-[56%] items-end gap-[6%]">
          {[46, 72, 58, 90, 64].map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[0.4cqw]" style={{ height: `${h}%`, background: ['#6A35B4', '#C8A56A', '#402078', '#E7C2CF', '#6A35B4'][i] }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CalendarsDiaries() {
  const today = new Date()
  const days = [0, 1, 2, 3].map((k) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + k))
  return (
    <>
      <div className="diary flex flex-col items-center justify-center text-center">
        <span className="absolute inset-y-0 right-[16%] w-[1.2cqw] bg-plum-night/70" />
        <span className="font-display text-[4.4cqw] italic leading-none text-gold-hi">Diary</span>
        <span className="mt-[1cqw] text-[1.5cqw] font-bold tracking-[0.3em] text-gold">{today.getMonth() >= 8 ? today.getFullYear() + 1 : today.getFullYear()}</span>
      </div>
      <div className="vz-center cal">
        <div className="cal-stand" />
        {days.map((d, i) => (
          <div key={i} className="cal-page" style={v({ '--i': i })}>
            <div className="face flex flex-col overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-plum to-violet py-[1.4cqw] text-center text-[1.7cqw] font-bold uppercase tracking-[0.3em] text-ivory">
                {d.toLocaleDateString('en-IN', { month: 'long' })}
              </div>
              <div className="flex flex-1 flex-col items-center justify-center">
                <span className="font-display text-[13cqw] font-medium leading-none text-plum">{d.getDate()}</span>
                <span className="mt-[0.6cqw] text-[1.5cqw] font-bold uppercase tracking-[0.3em] text-gold-text">
                  {d.toLocaleDateString('en-IN', { weekday: 'long' })}
                </span>
              </div>
            </div>
            <div className="face face-back bg-ivory-2" style={{ transform: 'rotateX(180deg)' }} />
          </div>
        ))}
        <div className="cal-wire">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
      </div>
    </>
  )
}

export const VISUALS: Record<GalleryId, () => ReactElement> = {
  'visiting-cards': VisitingCards,
  invitations: Invitation,
  letterheads: Letterheads,
  'id-stamps': IdStamps,
  'offset-screen-flex': OffsetScreenFlex,
  binding: Binding,
  'paper-charts': PaperCharts,
  'calendars-diaries': CalendarsDiaries,
}

/** The backdrop each visual sits on. */
export const VISUAL_BG: Record<GalleryId, string> = {
  'visiting-cards': 'radial-gradient(70% 80% at 50% 40%, #FBEFF2, #F1E4D6)',
  invitations: 'radial-gradient(70% 70% at 50% 40%, #F7E8EC, #EAD6DD)',
  letterheads: 'radial-gradient(70% 80% at 50% 40%, #FFF9F0, #EEE3D3)',
  'id-stamps': 'radial-gradient(70% 80% at 40% 40%, #F3ECF8, #E4D8EC)',
  'offset-screen-flex': 'radial-gradient(70% 80% at 50% 40%, #FFF9F0, #F1E2D8)',
  binding: 'radial-gradient(70% 70% at 50% 40%, #F1EAF7, #E0D3EA)',
  'paper-charts': 'radial-gradient(70% 80% at 50% 40%, #FFF9F0, #EFE5D6)',
  'calendars-diaries': 'radial-gradient(70% 80% at 40% 40%, #FBEFF2, #EBDDE2)',
}

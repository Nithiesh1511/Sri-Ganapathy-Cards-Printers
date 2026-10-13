import type { CSSProperties } from 'react'
import { serviceMessage, whatsappUrl } from '@/utils/whatsapp'
import { WhatsApp } from './Icons'

// Only services printed on the card — nothing the business hasn't said it offers.
const SCHOOL_SERVICES = ['ID Cards', 'Paper and Charts', 'Chart Binding', 'Spiral Binding', 'Book Binding', 'Diary Printing', 'Calendars', 'Invitation Printing']

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/** A still-life of school printing, in CSS. */
function Composition() {
  return (
    <div className="relative mx-auto aspect-[1.05] w-full max-w-[36rem] [container-type:inline-size]" aria-hidden>
      {/* Educational chart */}
      <div className="reveal absolute left-[4%] top-[2%] w-[56%] [rotate:-6deg]" style={d(0)}>
        <div className="aspect-[0.78] rounded-md bg-[#FFFDF8] p-[5%] shadow-lift">
          <div className="h-[6%] w-[60%] rounded bg-plum/80" />
          <div className="mt-[3%] h-[3%] w-[40%] rounded bg-gold/70" />
          <div className="mt-[8%] grid grid-cols-3 gap-[6%]">
            {['#6A35B4', '#C8A56A', '#E7C2CF', '#B79BE0', '#402078', '#F3E2A6'].map((c) => (
              <div key={c} className="aspect-square rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="mt-[8%] space-y-[4%]">
            {[90, 70, 80].map((w) => <div key={w} className="h-[2.4cqw] rounded bg-ink/10" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      </div>
      {/* Rolled charts */}
      <div className="reveal absolute right-[6%] top-[4%] flex gap-[2cqw] [rotate:8deg]" style={d(120)}>
        {['#C3D5E8', '#F3E2A6', '#E7C2CF'].map((c) => (
          <div key={c} className="h-[46cqw] w-[6.5cqw] rounded-full shadow-paper" style={{ background: `linear-gradient(90deg, ${c}, #fff 45%, ${c})` }} />
        ))}
      </div>
      {/* Spiral notebook */}
      <div className="reveal absolute bottom-[6%] left-[14%] w-[44%] [rotate:4deg]" style={d(220)}>
        <div className="relative aspect-[0.78] rounded-r-xl rounded-l-sm bg-gradient-to-br from-violet to-plum shadow-lift">
          <div className="absolute inset-y-[5%] -left-[4%] flex flex-col justify-between">
            {Array.from({ length: 10 }, (_, i) => <span key={i} className="h-[2.2cqw] w-[6cqw] rounded-full border-[0.7cqw] border-gold" />)}
          </div>
          <div className="absolute inset-x-[16%] top-[30%] rounded bg-ivory px-[8%] py-[6%] text-center">
            <span className="font-display text-[5cqw] italic leading-none text-plum">Notes</span>
          </div>
        </div>
      </div>
      {/* Printed, bound document */}
      <div className="reveal absolute bottom-[10%] right-[30%] w-[30%] [rotate:-10deg]" style={d(300)}>
        <div className="aspect-[0.707] rounded bg-white shadow-lift">
          <div className="h-[14%] rounded-t bg-plum" />
          <div className="space-y-[7%] p-[10%]">
            {[80, 92, 70, 88, 60].map((w) => <div key={w} className="h-[1.4cqw] rounded bg-ink/10" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      </div>
      {/* ID card on a lanyard */}
      <div className="reveal absolute bottom-[2%] right-[2%] w-[24%] [rotate:9deg]" style={d(380)}>
        <div className="mx-auto -mb-[3%] h-[16cqw] w-[4cqw] bg-gradient-to-b from-violet to-plum" />
        <div className="aspect-[0.63] overflow-hidden rounded-xl bg-white shadow-lift">
          <div className="h-[22%] bg-gradient-to-r from-plum to-violet" />
          <div className="mx-auto -mt-[16%] h-[38%] w-[56%] rounded-full border-[1cqw] border-white bg-blush" />
          <div className="mt-[8%] space-y-[6%] px-[14%]">
            <div className="mx-auto h-[1.8cqw] w-[80%] rounded bg-plum/70" />
            <div className="mx-auto h-[1.2cqw] w-[50%] rounded bg-gold/80" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SchoolPrinting() {
  return (
    <section id="school" aria-labelledby="school-title" className="section relative overflow-hidden bg-blush/40">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_30%,rgb(183_155_224/0.25),transparent_70%)]" aria-hidden />
      <div className="wrap relative grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="eyebrow reveal">School printing</p>
          <h2 id="school-title" className="h-section reveal mt-5" style={d(80)}>
            Everything Your School Needs. <span className="italic text-violet">Printed with Care.</span>
          </h2>
          <p className="lede reveal mt-6" style={d(160)}>
            From everyday school stationery to educational charts and professionally printed materials, bring your requirements together in one place.
          </p>
          <ul className="reveal mt-8 flex flex-wrap gap-2" style={d(240)} aria-label="Services for schools">
            {SCHOOL_SERVICES.map((s) => (
              <li key={s} className="rounded-full border border-plum/15 bg-white/70 px-3.5 py-1.5 text-[0.85rem] font-medium text-plum">{s}</li>
            ))}
          </ul>
          <div className="reveal mt-10" style={d(320)}>
            <a href={whatsappUrl(serviceMessage('School Printing'))} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <WhatsApp width={18} /> Enquire About School Printing
            </a>
          </div>
        </div>
        <Composition />
      </div>
    </section>
  )
}

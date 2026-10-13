import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { BUSINESS, GROUPS, serviceById, type ServiceId } from '@/data/site'
import { canHover, prefersReducedMotion } from '@/lib/hooks'
import { Arrow, Instagram, Mail, Phone } from './Icons'
import { PinwheelMark } from './Logo'

/**
 * The business card, as an object: front shows the mark and name, the back carries
 * every way to reach the shop. Click or tap to flip; on a mouse it also leans toward
 * the pointer.
 */
function FlipCard() {
  const [flipped, setFlipped] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !canHover() || prefersReducedMotion()) return
    const scene = el.parentElement!
    const move = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--tx', `${(-y * 14).toFixed(2)}deg`)
      el.style.setProperty('--ty', `${(x * 18).toFixed(2)}deg`)
    }
    const leave = () => { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg') }
    scene.addEventListener('pointermove', move)
    scene.addEventListener('pointerleave', leave)
    return () => { scene.removeEventListener('pointermove', move); scene.removeEventListener('pointerleave', leave) }
  }, [])

  return (
    <div className="flip-scene mx-auto w-full max-w-[34rem]" style={{ aspectRatio: '1.75' }}>
      <div
        ref={ref}
        className="flip h-full w-full cursor-pointer"
        style={{ '--flip': flipped ? '180deg' : '0deg' } as CSSProperties}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? 'Business card, back. Press to turn it over.' : 'Business card, front. Press to turn it over.'}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f) } }}
        data-cursor
      >
        {/* Front: a heavy ivory stock with a gilt keyline. Always light, so the foil reads in every theme. */}
        <div
          className="flip-face shadow-lift"
          style={{ fontSize: 'clamp(10px, 2.55vw, 16px)', background: 'linear-gradient(135deg, #FDF6E6 0%, #EBD9B2 100%)', color: '#1B1711' }}
        >
          <div aria-hidden className="absolute inset-[0.55em] rounded-[0.7em] border border-[#B8862B]/55" />
          <div aria-hidden className="absolute inset-[0.95em] rounded-[0.45em] border border-[#B8862B]/25" />
          <div className="halftone absolute inset-0 text-[#B8862B]/20" style={{ WebkitMaskImage: 'linear-gradient(115deg,#000,transparent 50%)', maskImage: 'linear-gradient(115deg,#000,transparent 50%)' }} />
          <div className="relative flex h-full items-center gap-[1.6em] px-[2.6em]">
            <PinwheelMark size={110} className="h-[7.2em] w-[7.2em] shrink-0" />
            <div>
              {/* this face is always ivory, so it takes the light-theme foil whatever theme is on */}
              <p className="foil-text font-display text-[2.6em] italic leading-none" style={{ '--foil-1': '122 84 15', '--foil-2': '184 134 43', '--foil-3': '222 180 88' } as CSSProperties}>
                {BUSINESS.line1}
              </p>
              <p className="mt-[0.8em] font-sans text-[0.66em] font-bold uppercase tracking-[0.34em] text-[#4E4538]">{BUSINESS.line2}</p>
              <div className="mt-[1.2em] h-px w-[5em] bg-gradient-to-r from-[#B8862B] to-transparent" />
              <p className="mt-[1em] font-sans text-[0.6em] font-bold uppercase tracking-[0.3em] text-[#805A14]">Tap to turn over</p>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-[0.5em]">
            <i className="flex-1 bg-cy" /><i className="flex-1 bg-mg" /><i className="flex-1 bg-ye" /><i className="flex-1 bg-key" />
          </div>
        </div>

        {/* Back: midnight, with the contact lines in gold. */}
        <div
          className="flip-face flip-back text-ivory shadow-lift"
          style={{ fontSize: 'clamp(10px, 2.55vw, 16px)', background: 'radial-gradient(120% 140% at 0% 0%, #2b2246 0%, #120e1f 62%, #0a0812 100%)' }}
        >
          <div aria-hidden className="absolute inset-[0.55em] rounded-[0.7em] border border-gold-hi/45" />
          <div className="halftone absolute inset-0 text-gold-hi/15" style={{ WebkitMaskImage: 'radial-gradient(circle at 100% 0, #000, transparent 65%)', maskImage: 'radial-gradient(circle at 100% 0, #000, transparent 65%)' }} />
          <div className="relative flex h-full flex-col justify-center gap-[0.7em] px-[2.6em]">
            <p className="foil-text-lt font-display text-[1.7em] italic leading-none">{BUSINESS.name}</p>
            <div className="h-px w-[4em] bg-gradient-to-r from-gold-hi to-transparent" />
            {BUSINESS.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-[0.7em] font-sans text-[1.1em] font-bold tracking-wide hover:text-gold-hi">
                <Phone className="h-[1.1em] w-[1.1em] text-gold-hi" /> {p.display}
              </a>
            ))}
            <a href={`mailto:${BUSINESS.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-[0.7em] font-mono text-[0.78em] hover:text-gold-hi">
              <Mail className="h-[1.2em] w-[1.2em] text-gold-hi" /> {BUSINESS.email}
            </a>
            <a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-[0.7em] font-mono text-[0.78em] hover:text-gold-hi">
              <Instagram className="h-[1.2em] w-[1.2em] text-gold-hi" /> @{BUSINESS.instagram.handle}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The enquiry form has no server behind it, so it writes the email for you and hands it to your mail app. */
function QuoteForm() {
  const [service, setService] = useState<ServiceId | ''>('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<ServiceId>).detail
      if (id) { setService(id); setSent(false) }
    }
    const onNote = (e: Event) => {
      const note = (e as CustomEvent<string>).detail
      if (note) { setMessage((m) => (m.includes(note) ? m : m ? `${m}\n${note}` : note)); setSent(false) }
    }
    window.addEventListener('contact:prefill', on)
    window.addEventListener('contact:note', onNote)
    return () => { window.removeEventListener('contact:prefill', on); window.removeEventListener('contact:note', onNote) }
  }, [])

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const what = service ? serviceById(service).name : 'General enquiry'
    const lines = [
      `Name: ${f.get('name') ?? ''}`,
      `Phone: ${f.get('phone') ?? ''}`,
      `Looking for: ${what}`,
      '',
      message,
    ]
    const href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(`Enquiry — ${what}`)}&body=${encodeURIComponent(lines.join('\n'))}`
    window.location.href = href
    setSent(true)
  }

  const label = 'mb-1 block font-sans text-[10px] font-bold uppercase tracking-[0.26em] text-ink-mute'

  return (
    <form onSubmit={submit} className="panel p-7 sm:p-10">
      <p className="eyebrow mb-4">Request a quote</p>
      <h3 className="font-display text-3xl font-normal italic sm:text-4xl">
        Tell us <span className="foil-text">what you need</span>
      </h3>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Your name</span>
          <input name="name" required autoComplete="name" className="field" placeholder="Name" />
        </label>
        <label className="block">
          <span className={label}>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" className="field" placeholder="Your number" />
        </label>
      </div>
      <label className="mt-6 block">
        <span className={label}>What are you looking for?</span>
        <select value={service} onChange={(e) => setService(e.target.value as ServiceId | '')} className="field appearance-none">
          <option value="">Not sure yet — let's talk</option>
          {GROUPS.map((g) => (
            <optgroup key={g.id} label={g.name}>
              {g.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="mt-6 block">
        <span className={label}>Details</span>
        <textarea name="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="field resize-y" placeholder="Quantity, size, date you need it by…" />
      </label>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-gold">
          Send by email <Arrow width={16} />
        </button>
        <a href={`tel:${BUSINESS.phones[0].tel}`} className="btn btn-ghost">
          <Phone width={16} /> Or call
        </a>
      </div>
      <p className="mt-5 text-[12.5px] leading-relaxed text-ink-mute" role="status">
        {sent
          ? 'Your email app should be opening with the message ready to send. If it doesn’t, write to us at the address on the left.'
          : 'This opens your email app with your enquiry already written — nothing is sent until you press send there.'}
      </p>
    </form>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.12] blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-accent/[0.08] blur-[120px]" />
      <div className="container-x relative grid gap-14 lg:grid-cols-[1.02fr_1fr] lg:gap-16">
        <div>
          <header className="reveal">
            <p className="eyebrow mb-6">Say hello</p>
            <h2 className="text-balance font-display text-[2.6rem] font-normal leading-[1.04] sm:text-6xl">
              Let’s print something <span className="foil-text italic">wonderful.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-ink-soft sm:text-[17px]">
              Tell us what you have in mind — call, write, or send a message on Instagram. We handle all your school
              printing, invitations and business printing.
            </p>
          </header>

          <div className="reveal mt-9 flex flex-wrap gap-3" style={{ '--d': 1 } as CSSProperties}>
            {BUSINESS.phones.map((p, i) => (
              <a key={p.tel} href={`tel:${p.tel}`} className={`btn ${i === 0 ? 'btn-gold' : 'btn-ghost'}`}>
                <Phone width={17} /> {p.display}
              </a>
            ))}
          </div>
          <ul className="reveal mt-7 space-y-3.5 font-sans text-[15px] font-semibold" style={{ '--d': 2 } as CSSProperties}>
            <li>
              <a href={`mailto:${BUSINESS.email}`} className="group inline-flex items-center gap-3.5 break-all transition-colors duration-500 hover:text-gold-text">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-text transition-colors duration-500 group-hover:bg-gold/15">
                  <Mail width={18} />
                </span>
                {BUSINESS.email}
              </a>
            </li>
            <li>
              <a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3.5 transition-colors duration-500 hover:text-gold-text">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-text transition-colors duration-500 group-hover:bg-gold/15">
                  <Instagram width={18} />
                </span>
                @{BUSINESS.instagram.handle}
              </a>
            </li>
          </ul>

          <div className="reveal mt-14" style={{ '--d': 3 } as CSSProperties}>
            <FlipCard />
            <p className="mt-5 text-center font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-ink-mute">
              ↺ Our card — turn it over
            </p>
          </div>
        </div>

        <div className="reveal lg:pt-6" style={{ '--d': 2 } as CSSProperties}>
          <QuoteForm />
        </div>
      </div>
    </section>
  )
}

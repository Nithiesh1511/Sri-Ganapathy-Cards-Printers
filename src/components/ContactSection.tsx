import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ALL_SERVICE_NAMES, BUSINESS } from '@/data/site'
import { detailedMessage, mailtoUrl, openExternal, whatsappUrl } from '@/utils/whatsapp'
import { onEnquiryPrefill } from '@/utils/enquiry'
import { Alert, Arrow, Check, Instagram, Mail, Phone, WhatsApp } from './Icons'

const SERVICE_OPTIONS = [...ALL_SERVICE_NAMES, 'School Printing', 'Something else']

interface Values { name: string; phone: string; service: string; requirements: string; message: string; company: string }
type Errors = Partial<Record<keyof Values, string>>
type Status =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | { kind: 'opened'; via: 'whatsapp' | 'email'; url: string }
  | { kind: 'blocked'; url: string }
  | { kind: 'error'; text: string }

const EMPTY: Values = { name: '', phone: '', service: '', requirements: '', message: '', company: '' }

function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your name.'
  const digits = v.phone.replace(/[\s\-()]/g, '')
  if (!digits) e.phone = 'Please enter a phone number so we can reply.'
  else if (!/^(\+?91|0)?[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a 10-digit mobile number, e.g. 98765 43210.'
  if (!v.service) e.service = 'Choose the service you need.'
  if (v.requirements.trim().length < 3) e.requirements = 'Tell us the quantity or what you need.'
  if (v.message.length > 1000) e.message = 'Please keep the message under 1000 characters.'
  return e
}

function buildMessage(v: Values) {
  return detailedMessage(`I would like to enquire about ${v.service}.`, [
    ['Name', v.name],
    ['Phone', v.phone],
    ['Service', v.service],
    ['Quantity / requirements', v.requirements],
    ['Message', v.message],
  ])
}

function ContactLink({ href, icon, label, value, external, wide }: { href: string; icon: ReactNode; label: string; value: string; external?: boolean; wide?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group flex min-w-0 items-center gap-4 rounded-2xl ${wide ? 'sm:col-span-2' : ''} border border-ivory/10 bg-ivory/[0.04] p-4 transition-colors duration-500 hover:border-gold/50 hover:bg-ivory/[0.08]`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-gold-hi">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ivory/55">{label}</span>
        <span className="block text-[1.02rem] [overflow-wrap:anywhere] font-semibold text-ivory">{value}</span>
      </span>
      <Arrow width={18} className="ml-auto shrink-0 text-gold-hi opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100" />
    </a>
  )
}

export default function ContactSection() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const mountedAt = useRef(Date.now())
  const lastSent = useRef(0)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => onEnquiryPrefill((d) => {
    setValues((v) => ({
      ...v,
      service: d.service && SERVICE_OPTIONS.includes(d.service) ? d.service : v.service,
      requirements: d.requirements ?? v.requirements,
      message: d.message ?? v.message,
    }))
    setStatus({ kind: 'idle' })
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 700)
  }), [])

  const set = (k: keyof Values) => (e: { target: { value: string } }) => {
    const value = e.target.value
    setValues((v) => ({ ...v, [k]: value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = (via: 'whatsapp' | 'email') => (e?: FormEvent) => {
    e?.preventDefault()
    // Spam-conscious: a hidden field people never see, a minimum fill time, and a short cool-down.
    if (values.company) return
    const errs = validate(values)
    setErrors(errs)
    const firstInvalid = (Object.keys(EMPTY) as (keyof Values)[]).find((k) => errs[k])
    if (firstInvalid) {
      setStatus({ kind: 'idle' })
      document.getElementById(`f-${firstInvalid}`)?.focus()
      return
    }
    if (Date.now() - mountedAt.current < 2500) {
      setStatus({ kind: 'error', text: 'That was quick — please check your details and try again.' })
      return
    }
    if (Date.now() - lastSent.current < 8000) {
      setStatus({ kind: 'error', text: 'Your message was just prepared. Please wait a few seconds before trying again.' })
      return
    }
    lastSent.current = Date.now()
    const text = buildMessage(values)
    setStatus({ kind: 'preparing' })
    if (via === 'whatsapp') {
      const url = whatsappUrl(text)
      // Opened straight from the click, so browsers treat it as user-initiated.
      const ok = openExternal(url)
      window.setTimeout(() => setStatus(ok ? { kind: 'opened', via, url } : { kind: 'blocked', url }), 350)
    } else {
      const url = mailtoUrl(`Enquiry: ${values.service}`, text)
      window.location.href = url
      window.setTimeout(() => setStatus({ kind: 'opened', via, url }), 350)
    }
  }

  const field = (k: keyof Values) => ({
    id: `f-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    'aria-invalid': errors[k] ? (true as const) : undefined,
    'aria-describedby': errors[k] ? `f-${k}-err` : undefined,
  })
  const err = (k: keyof Values) =>
    errors[k] ? (
      <p id={`f-${k}-err`} className="field-error"><Alert width={15} /> {errors[k]}</p>
    ) : null

  return (
    <section id="contact" aria-labelledby="contact-title" className="on-dark relative overflow-hidden bg-plum-night text-ivory">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_15%_10%,rgb(106_53_180/0.55),transparent_70%),radial-gradient(50%_50%_at_90%_90%,rgb(200_165_106/0.18),transparent_70%)]" aria-hidden />
      <div className="wrap section relative grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="min-w-0">
          <p className="eyebrow reveal">Contact</p>
          <h2 id="contact-title" className="reveal mt-5 font-display text-[clamp(2.6rem,5.4vw,4.6rem)] font-medium leading-[1] text-ivory">
            Let&rsquo;s Bring Your Ideas <span className="italic text-gold-hi">to Print.</span>
          </h2>
          <p className="reveal mt-6 max-w-[30rem] text-lg leading-relaxed text-ivory/75">
            Call, message or write to us with what you need — we&rsquo;ll talk you through the options.
          </p>
          <div className="reveal mt-10 grid gap-3 sm:grid-cols-2">
            {BUSINESS.phones.map((p) => (
              <ContactLink key={p.tel} href={`tel:${p.tel}`} icon={<Phone />} label="Call" value={p.display} />
            ))}
            <ContactLink href={`mailto:${BUSINESS.email}`} icon={<Mail />} label="Email" value={BUSINESS.email} wide />
            <ContactLink href={BUSINESS.instagram.url} icon={<Instagram />} label="Instagram" value={`@${BUSINESS.instagram.handle}`} external wide />
          </div>
        </div>

        <div className="reveal min-w-0" style={{ '--d': '150ms' } as React.CSSProperties}>
          <form
            noValidate
            onSubmit={submit('whatsapp')}
            className="grain rounded-[2rem] bg-ivory p-6 text-ink shadow-[0_60px_120px_-40px_rgb(0_0_0/0.6)] sm:p-9"
            aria-describedby="form-note"
          >
            <h3 className="font-display text-[2rem] font-medium text-plum">Send an enquiry</h3>
            <p id="form-note" className="mt-1.5 text-[0.88rem] text-ink-mute">
              This form doesn&rsquo;t send anything by itself: it writes your message into WhatsApp or your email app, so you can check it before you press send.
            </p>

            <div className="relative z-10 mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="f-name" className="field-label">Name</label>
                <input ref={nameRef} {...field('name')} className="field" autoComplete="name" required />
                {err('name')}
              </div>
              <div>
                <label htmlFor="f-phone" className="field-label">Phone number</label>
                <input {...field('phone')} className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" required />
                {err('phone')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-service" className="field-label">Service required</label>
                <select {...field('service')} className="field appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23402078%22%20stroke-width=%222%22%3E%3Cpath%20d=%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-10" required>
                  <option value="">Choose a service…</option>
                  {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {err('service')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-requirements" className="field-label">Quantity or requirements</label>
                <input {...field('requirements')} className="field" placeholder="e.g. 500 cards, double-sided" required />
                {err('requirements')}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-message" className="field-label">Additional message <span className="font-medium normal-case tracking-normal text-ink-mute">(optional)</span></label>
                <textarea {...field('message')} className="field min-h-[7rem] resize-y" maxLength={1000} />
                {err('message')}
              </div>
              {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
              <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
                <label htmlFor="f-company">Company</label>
                <input {...field('company')} tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="btn btn-primary flex-1" disabled={status.kind === 'preparing'}>
                <WhatsApp width={18} /> {status.kind === 'preparing' ? 'Preparing your message…' : 'Send via WhatsApp'}
              </button>
              <button type="button" className="btn btn-outline" onClick={submit('email')} disabled={status.kind === 'preparing'}>
                <Mail width={18} /> Send via Email
              </button>
            </div>

            <div aria-live="polite" className="relative z-10">
              {status.kind === 'opened' && (
                <div className="mt-5 flex gap-3 rounded-2xl bg-[#EEF6EE] p-4 text-[0.9rem] text-[#1E4620]">
                  <Check width={18} className="mt-0.5 shrink-0" />
                  <p>
                    {status.via === 'whatsapp'
                      ? <>WhatsApp has opened in a new tab with your enquiry written in. <strong>Press send there</strong> to deliver it.</>
                      : <>Your email app should now be open with the message ready. <strong>Press send there</strong> to deliver it. If nothing opened, email us at <a className="underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</>}
                  </p>
                </div>
              )}
              {status.kind === 'blocked' && (
                <div className="mt-5 flex gap-3 rounded-2xl bg-[#FBEDEC] p-4 text-[0.9rem] text-[#7A1F17]">
                  <Alert width={18} className="mt-0.5 shrink-0" />
                  <p>
                    Your browser blocked the new tab, so nothing has been sent yet.{' '}
                    <a href={status.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Open WhatsApp with your message</a>, or call {BUSINESS.phones[0].display}.
                  </p>
                </div>
              )}
              {status.kind === 'error' && (
                <div className="mt-5 flex gap-3 rounded-2xl bg-[#FBEDEC] p-4 text-[0.9rem] text-[#7A1F17]">
                  <Alert width={18} className="mt-0.5 shrink-0" />
                  <p>{status.text}</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

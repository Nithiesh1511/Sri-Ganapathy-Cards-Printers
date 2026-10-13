import { useEffect, useState } from 'react'
import { BUSINESS } from '@/data/site'
import { serviceMessage, whatsappUrl } from '@/utils/whatsapp'
import { Phone, WhatsApp } from './Icons'

/**
 * On phones, Call and WhatsApp stay one thumb away once you've scrolled past the hero.
 * They step aside in the customizer and contact sections, which have their own buttons.
 */
export default function CallBar() {
  const [scrolled, setScrolled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.9)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const inView = new Set<string>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target.id)
        else inView.delete(e.target.id)
      }
      setBusy(inView.size > 0)
    })
    for (const id of ['customize', 'contact']) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  const show = scrolled && !busy
  const cls = `inline-flex h-[3.25rem] items-center gap-2 rounded-full px-5 text-[0.9rem] font-semibold shadow-lift`
  return (
    <div
      className={`fixed bottom-4 right-4 z-40 flex gap-2 transition-all duration-500 ease-lux lg:hidden ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
      {...(show ? {} : { inert: '' })}
    >
      <a href={whatsappUrl(serviceMessage('printing'))} target="_blank" rel="noopener noreferrer" className={`${cls} bg-ivory text-plum ring-1 ring-plum/15`} aria-label="Message us on WhatsApp">
        <WhatsApp width={18} /> WhatsApp
      </a>
      <a href={`tel:${BUSINESS.phones[0].tel}`} className={`${cls} bg-plum text-ivory`} aria-label={`Call ${BUSINESS.phones[0].display}`}>
        <Phone width={18} /> Call
      </a>
    </div>
  )
}

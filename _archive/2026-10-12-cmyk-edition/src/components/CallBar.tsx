import { useEffect, useState } from 'react'
import { BUSINESS } from '@/data/site'
import { Phone } from './Icons'

/**
 * On phones, a call button that's always one thumb away once you've scrolled past the
 * hero. It steps aside in the showroom and contact sections, which carry their own
 * buttons in the same corner.
 */
export default function CallBar() {
  const [scrolled, setScrolled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 1.2)
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
    for (const id of ['showroom', 'contact']) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  const show = scrolled && !busy
  return (
    <a
      href={`tel:${BUSINESS.phones[0].tel}`}
      aria-label={`Call ${BUSINESS.phones[0].display}`}
      tabIndex={show ? 0 : -1}
      className={`btn btn-gold fixed bottom-4 right-4 z-40 !min-h-[3.2rem] !px-5 transition-all duration-500 lg:hidden ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <Phone width={18} /> Call
    </a>
  )
}

import { BUSINESS, SERVICE_GROUPS } from '@/data/site'
import { Logo } from './Logo'
import { Instagram, Mail, Phone } from './Icons'
import CardFace from './CardFace'

export default function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-plum text-ivory">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden />
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr] lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:py-20">
        <div>
          <a href="#home" aria-label={`${BUSINESS.name} — back to top`}><Logo light /></a>
          <p className="mt-6 max-w-[22rem] font-display text-[1.4rem] italic leading-snug text-ivory/85">
            Your ideas, beautifully printed — from visiting cards to more.
          </p>
        </div>

        <nav aria-label="Services">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold-hi">Services</p>
          <ul className="mt-5 space-y-2.5">
            {SERVICE_GROUPS.map((g) => (
              <li key={g.name}><a href="#services" className="text-ivory/75 transition-colors hover:text-ivory">{g.name}</a></li>
            ))}
            <li><a href="#school" className="text-ivory/75 transition-colors hover:text-ivory">School Printing</a></li>
          </ul>
        </nav>

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold-hi">Contact</p>
          <ul className="mt-5 space-y-3 text-ivory/80">
            {BUSINESS.phones.map((p) => (
              <li key={p.tel}><a href={`tel:${p.tel}`} className="inline-flex items-center gap-2.5 hover:text-ivory"><Phone width={16} className="text-gold" /> {p.display}</a></li>
            ))}
            <li><a href={`mailto:${BUSINESS.email}`} className="inline-flex items-center gap-2.5 break-all hover:text-ivory"><Mail width={16} className="shrink-0 text-gold" /> {BUSINESS.email}</a></li>
            <li><a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-ivory"><Instagram width={16} className="text-gold" /> @{BUSINESS.instagram.handle}</a></li>
          </ul>
        </div>

        {/* A business card turning slowly — the house signature. */}
        <div className="hidden items-center justify-center [perspective:900px] lg:flex" aria-hidden>
          <div className="turn-card relative aspect-[1.75] w-44">
            <div className="face rounded-[4px] shadow-lift"><CardFace id="brand-front" /></div>
            <div className="face face-back rounded-[4px]"><CardFace id="brand-back" /></div>
          </div>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[0.8rem] text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
          <p>Crafted with precision · Printed with passion</p>
        </div>
      </div>
    </footer>
  )
}

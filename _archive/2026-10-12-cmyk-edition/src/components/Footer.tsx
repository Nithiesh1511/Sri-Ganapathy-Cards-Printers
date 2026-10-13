import { BUSINESS, GROUPS } from '@/data/site'
import { openInShowroom } from '@/lib/actions'
import { Logo } from './Logo'
import { ArrowDown, Instagram, Mail, Phone } from './Icons'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-ivory">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-hi/60 to-transparent" />
      {/* The name, set enormous and hollow along the foot of the page. */}
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-0.12em] select-none whitespace-nowrap text-center font-display text-[clamp(3.4rem,15.5vw,15rem)] font-normal italic leading-none text-transparent"
        style={{ WebkitTextStroke: '1px rgba(243,217,143,0.2)' }}
      >
        Sri Ganapathy
      </p>
      <div aria-hidden className="halftone halftone-fade pointer-events-none absolute right-0 top-0 h-72 w-[60%] text-gold-hi/[0.09]" />

      <div className="container-x relative pb-44 pt-20 sm:pb-56 sm:pt-24">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr] lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-7 max-w-sm font-display text-2xl font-normal italic leading-snug text-ivory/85">
              School printing, invitations and a complete range of business printing.
            </p>
            <div className="orn mt-8 max-w-[13rem] text-gold-hi/70"><i /></div>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow mb-5 !text-gold-hi">Explore</p>
            <ul className="space-y-3 font-sans text-[15px] font-medium">
              {[['#top', 'Home'], ['#promises', 'What we do'], ['#showroom', 'Showroom'], ['#contact', 'Contact']].map(([href, label]) => (
                <li key={href}><a href={href} className="text-ivory/75 transition duration-500 hover:text-gold-hi">{label}</a></li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-5 !text-gold-hi">Print</p>
            <ul className="space-y-3 font-sans text-[15px] font-medium">
              {GROUPS.map((g) => (
                <li key={g.id}>
                  <button type="button" onClick={() => openInShowroom(g.items[0].id)} className="text-left text-ivory/75 transition duration-500 hover:text-gold-hi">
                    {g.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5 !text-gold-hi">Reach us</p>
            <ul className="space-y-3.5 font-sans text-[15px] font-medium">
              {BUSINESS.phones.map((p) => (
                <li key={p.tel}><a href={`tel:${p.tel}`} className="inline-flex items-center gap-2.5 text-ivory/90 transition duration-500 hover:text-gold-hi"><Phone width={17} className="text-gold-hi" /> {p.display}</a></li>
              ))}
              <li><a href={`mailto:${BUSINESS.email}`} className="inline-flex items-start gap-2.5 break-all text-ivory/90 transition duration-500 hover:text-gold-hi"><Mail width={17} className="mt-1 shrink-0 text-gold-hi" /> {BUSINESS.email}</a></li>
              <li><a href={BUSINESS.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-ivory/90 transition duration-500 hover:text-gold-hi"><Instagram width={17} className="text-gold-hi" /> @{BUSINESS.instagram.handle}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-gold-hi/20 pt-6 font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-ivory/55">
          <p>© {new Date().getFullYear()} {BUSINESS.name}</p>
          <a href="#top" className="inline-flex items-center gap-2 transition duration-500 hover:text-gold-hi">
            Back to top <ArrowDown width={14} className="rotate-180" />
          </a>
        </div>
      </div>
    </footer>
  )
}

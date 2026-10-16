import type { CSSProperties, ReactElement } from 'react'
import { Clock, Shield, Truck, Tag } from './Icons'

const REASONS: { title: string; text: string; Icon: (p: { className?: string }) => ReactElement }[] = [
  { title: 'Fast Turnaround', text: 'Quick and reliable printing services to meet your deadlines, with express options available.', Icon: Clock },
  { title: 'Quality You Can Trust', text: 'High-quality printing with clear details, vibrant colors, and a professional finish.', Icon: Shield },
  { title: 'Flexible Delivery', text: 'Convenient delivery options to ensure your printed materials reach you on time.', Icon: Truck },
  { title: 'Competitive Pricing', text: 'Affordable rates for bulk orders, with cost-effective printing solutions for businesses.', Icon: Tag },
]

export default function WhyChooseUs() {
  return (
    <section id="why-us" aria-labelledby="why-title" className="section relative overflow-hidden bg-ivory !pt-14 sm:!pt-20">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgb(183_155_224/0.25),transparent_70%)]" aria-hidden />
      <div className="wrap relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow reveal">Why choose us</p>
          <h2 id="why-title" className="h-section reveal mt-5">
            Printing That Works <span className="italic text-violet">As Hard As You Do.</span>
          </h2>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ title, text, Icon }, i) => (
            <li
              key={title}
              className="reveal"
              style={{ '--d': `${i * 120}ms` } as CSSProperties}
            >
              <div className="group paper relative h-full overflow-hidden rounded-3xl border border-plum/10 p-7 shadow-paper transition-all duration-700 ease-lux hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_30px_60px_-30px_rgb(43_20_83/0.45)]">
              <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[linear-gradient(90deg,#6A35B4,#C8A56A)] transition-transform duration-700 ease-lux group-hover:scale-x-100" aria-hidden />
              <span className="absolute -right-2 -top-4 select-none font-display text-[6.5rem] italic leading-none text-plum/[0.05]" aria-hidden>
                0{i + 1}
              </span>
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-plum text-gold-hi shadow-[0_14px_26px_-12px_rgb(64_32_120/0.8)] transition-transform duration-700 ease-lux group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-6 font-display text-[1.6rem] font-medium leading-tight text-plum">{title}</h3>
              <p className="relative mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

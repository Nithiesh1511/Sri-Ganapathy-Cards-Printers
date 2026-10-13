import { ALL_SERVICES } from '@/data/site'

/** A small gilt diamond, used as the separator between services. */
function Gem() {
  return (
    <span className="mx-9 inline-flex items-center gap-2 align-middle sm:mx-12" aria-hidden>
      <i className="block h-px w-6 bg-gradient-to-r from-transparent to-gold-hi/70" />
      <i className="block h-2 w-2 rotate-45 bg-gold-hi" />
      <i className="block h-px w-6 bg-gradient-to-l from-transparent to-gold-hi/70" />
    </span>
  )
}

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  const items = ALL_SERVICES.map((s) => s.name)
  return (
    <div className="marquee-mask overflow-hidden" aria-hidden>
      <div className={`flex w-max whitespace-nowrap ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}>
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center">
            {items.map((name) => (
              <span key={name} className="flex items-center">
                <span
                  className={
                    outline
                      ? 'font-display text-[2.4rem] font-normal italic leading-none text-transparent sm:text-[3.4rem]'
                      : 'foil-text-lt font-display text-[2.4rem] font-normal leading-none sm:text-[3.4rem]'
                  }
                  style={outline ? { WebkitTextStroke: '1px rgba(243,217,143,0.75)' } : undefined}
                >
                  {name}
                </span>
                <Gem />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Everything on the card, scrolling past in two lines going opposite ways. */
export default function Marquee() {
  return (
    <section aria-label="Everything we print" className="relative overflow-hidden bg-night py-10 text-ivory sm:py-14">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-hi/60 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-hi/60 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-2 h-px bg-gradient-to-r from-transparent via-gold-hi/20 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-gold-hi/20 to-transparent" />
      <ul className="sr-only">
        {ALL_SERVICES.map((s) => <li key={s.id}>{s.name}</li>)}
      </ul>
      <div className="space-y-4 sm:space-y-5">
        <Row />
        <Row reverse outline />
      </div>
    </section>
  )
}

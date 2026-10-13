import { useEffect, useRef, useState } from 'react'
import { GALLERY, galleryById, type GalleryId, type GalleryItem } from '@/data/services'
import { serviceMessage, whatsappUrl } from '@/utils/whatsapp'
import { prefillEnquiry } from '@/utils/enquiry'
import { VISUALS, VISUAL_BG } from './ServiceVisuals'
import { Arrow, Close, WhatsApp } from './Icons'

/** Column spans for the editorial grid: wide/narrow pairs that alternate each row. */
const SPAN = ['lg:col-span-7', 'lg:col-span-5 lg:mt-20', 'lg:col-span-5', 'lg:col-span-7 lg:mt-20']

function ServiceCard({ item, index, onOpen }: { item: GalleryItem; index: number; onOpen: (id: GalleryId) => void }) {
  const Visual = VISUALS[item.id]
  const wide = SPAN[index % 4].includes('col-span-7')
  return (
    <article className={`svc reveal group ${SPAN[index % 4]}`} style={{ '--d': `${(index % 2) * 120}ms` } as React.CSSProperties}>
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="viz block w-full rounded-[1.75rem] shadow-paper transition-shadow duration-700 ease-lux group-hover:shadow-lift"
        style={{ background: VISUAL_BG[item.id], aspectRatio: wide ? '16 / 10' : '5 / 4' }}
        aria-label={`${item.name} — open details`}
      >
        <span className="grain absolute inset-0 rounded-[inherit]" aria-hidden />
        <Visual />
        <span className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[0.72rem] font-semibold text-ink-soft backdrop-blur transition-opacity duration-500 group-hover:opacity-0">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet motion-reduce:animate-none" /> {item.hint}
        </span>
      </button>
      <div className="mt-6 flex items-start gap-5 px-1">
        <span className="pt-1 font-display text-2xl italic text-gold-text">{item.no}</span>
        <div className="flex-1">
          <h3 className="font-display text-[1.9rem] font-medium leading-tight text-plum">{item.name}</h3>
          <p className="mt-2 max-w-[30rem] text-ink-soft">{item.short}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={whatsappUrl(serviceMessage(item.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[0.9rem] font-semibold text-plum underline decoration-gold decoration-1 underline-offset-[6px] transition-colors hover:text-violet"
            >
              Enquire About This Service <Arrow width={16} />
            </a>
            <button type="button" onClick={() => onOpen(item.id)} className="text-[0.9rem] font-semibold text-ink-mute hover:text-plum">
              Details
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function ServiceDialog({ id, onClose }: { id: GalleryId | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const item = id ? galleryById(id) : null

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (id && !d.open) d.showModal()
    if (!id && d.open) d.close()
  }, [id])

  const Visual = item ? VISUALS[item.id] : null
  return (
    <dialog
      ref={ref}
      className="svc-dialog"
      aria-labelledby="svc-dialog-title"
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {item && Visual && (
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="viz is-open min-h-[16rem] md:min-h-[30rem]" style={{ background: VISUAL_BG[item.id] }} aria-hidden>
            <Visual />
          </div>
          <div className="flex flex-col p-7 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <span className="font-display text-3xl italic text-gold-text">{item.no}</span>
              <button type="button" onClick={onClose} className="-mr-2 -mt-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-plum/5 hover:text-plum" aria-label="Close">
                <Close />
              </button>
            </div>
            <h3 id="svc-dialog-title" className="mt-2 font-display text-[2.4rem] font-medium leading-[1.05] text-plum">{item.name}</h3>
            <p className="mt-4 text-ink-soft">{item.long}</p>
            <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-ink-mute">Includes</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {item.includes.map((s) => (
                <li key={s} className="rounded-full border border-plum/15 bg-white px-3.5 py-1.5 text-[0.85rem] font-medium text-plum">{s}</li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
              <a href={whatsappUrl(serviceMessage(item.name))} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <WhatsApp width={18} /> Enquire on WhatsApp
              </a>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  onClose()
                  prefillEnquiry({ service: item.includes[0] })
                }}
              >
                Use the enquiry form
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}

export default function ServiceGallery() {
  const [open, setOpen] = useState<GalleryId | null>(null)
  return (
    <section id="services" aria-labelledby="services-title" className="section relative bg-ivory">
      <div className="wrap">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="reveal">
            <p className="eyebrow">Our services</p>
            <h2 id="services-title" className="h-section mt-5">
              A complete range of printing, <span className="italic text-violet">from visiting cards to more.</span>
            </h2>
          </div>
          <p className="lede reveal lg:justify-self-end" style={{ '--d': '120ms' } as React.CSSProperties}>
            Business stationery, invitations, binding, calendars and diaries — all under one roof. Hover a piece to see it move; open it for the details.
          </p>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-16 sm:gap-y-20 lg:mt-24 lg:grid-cols-12">
          {GALLERY.map((item, i) => (
            <ServiceCard key={item.id} item={item} index={i} onOpen={setOpen} />
          ))}
        </div>
      </div>
      <ServiceDialog id={open} onClose={() => setOpen(null)} />
    </section>
  )
}

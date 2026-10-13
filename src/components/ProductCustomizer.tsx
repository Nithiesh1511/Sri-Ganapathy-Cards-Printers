import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import {
  BACKGROUNDS, CANVAS_FONTS, DEFAULT_DESIGN, FINISHES, ORIENTATIONS, PRODUCTS, TYPEFACES,
  aspectOf, drawDesign, hasBack, type Design, type Side,
} from '@/lib/designArt'
import { prefersReducedMotion } from '@/lib/hooks'
import { BUSINESS } from '@/data/site'
import { detailedMessage, whatsappUrl } from '@/utils/whatsapp'
import { prefillEnquiry } from '@/utils/enquiry'
import { Download, Flip, RotateCcw, WhatsApp } from './Icons'

const label = <T extends { id: string; label: string }>(list: T[], id: string) => list.find((x) => x.id === id)!.label

function describe(d: Design): [string, string][] {
  return [
    ['Product', label(PRODUCTS, d.product)],
    ['Background', label(BACKGROUNDS, d.background)],
    ['Typography', label(TYPEFACES, d.typeface)],
    ['Finish', label(FINISHES, d.finish)],
    ['Orientation', label(ORIENTATIONS, d.orientation)],
  ]
}

/** A labelled group of native radios, styled as chips (arrow keys work for free). */
function Options<T extends string>({ name, legend, value, options, onChange, swatches }: {
  name: string
  legend: string
  value: T
  options: { id: T; label: string; swatch?: string; css?: string }[]
  onChange: (v: T) => void
  swatches?: boolean
}) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.id} className="chip cursor-pointer">
            <input type="radio" className="sr-only" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
            {swatches && o.swatch && <span className="h-4 w-4 rounded-full border border-ink/15" style={{ background: o.swatch }} aria-hidden />}
            <span style={o.css ? { fontFamily: o.css } : undefined}>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Face({ design, side, refreshKey }: { design: Design; side: Side; refreshKey: number }) {
  const colorRef = useRef<HTMLCanvasElement>(null)
  const [mask, setMask] = useState<string | null>(null)

  useEffect(() => {
    const c = colorRef.current
    if (!c) return
    drawDesign(c, design, side, 'color')
    if (design.finish === 'foil') {
      const m = document.createElement('canvas')
      drawDesign(m, design, side, 'foil', 550)
      setMask(m.toDataURL('image/png'))
    } else setMask(null)
  }, [design, side, refreshKey])

  return (
    <div className={`cz-face ${side === 'back' ? 'cz-face-back' : ''}`}>
      <canvas ref={colorRef} aria-hidden />
      {design.finish === 'glossy' && <div className="cz-gloss" />}
      {design.finish === 'foil' && mask && <div className="cz-foil" style={{ WebkitMaskImage: `url(${mask})`, maskImage: `url(${mask})` }} />}
    </div>
  )
}

export default function ProductCustomizer() {
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN)
  const [side, setSide] = useState<Side>('front')
  const [rot, setRot] = useState({ x: -8, y: -16 })
  const [dragging, setDragging] = useState(false)
  const [fontsKey, setFontsKey] = useState(0)
  const [note, setNote] = useState('')
  const drag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null)

  const back = hasBack(design.product)
  const effectiveSide: Side = back ? side : 'front'
  const aspect = aspectOf(design)
  const set = <K extends keyof Design>(k: K) => (v: Design[K]) => setDesign((d) => ({ ...d, [k]: v }))

  // Redraw once the typefaces the canvas uses are loaded.
  useEffect(() => {
    if (!document.fonts) return
    let alive = true
    Promise.all(CANVAS_FONTS.map((f) => document.fonts.load(f).catch(() => null))).then(() => alive && setFontsKey((k) => k + 1))
    return () => { alive = false }
  }, [])

  // Single-sided products always show their front.
  useEffect(() => { if (!back) setSide('front') }, [back])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    setRot({ x: Math.max(-35, Math.min(35, d.rx - (e.clientY - d.y) * 0.3)), y: d.ry + (e.clientX - d.x) * 0.45 })
  }
  const endDrag = () => { drag.current = null; setDragging(false) }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 12
    const map: Record<string, () => void> = {
      ArrowLeft: () => setRot((r) => ({ ...r, y: r.y - step })),
      ArrowRight: () => setRot((r) => ({ ...r, y: r.y + step })),
      ArrowUp: () => setRot((r) => ({ ...r, x: Math.min(35, r.x + step) })),
      ArrowDown: () => setRot((r) => ({ ...r, x: Math.max(-35, r.x - step) })),
    }
    if (map[e.key]) { e.preventDefault(); map[e.key]() }
  }

  const reset = () => { setDesign(DEFAULT_DESIGN); setSide('front'); setRot({ x: -8, y: -16 }) }

  const download = useCallback(() => {
    // The chosen side, on an ivory mat with a caption, as a PNG.
    const art = document.createElement('canvas')
    drawDesign(art, design, effectiveSide, 'color', 1400)
    const pad = 90
    const out = document.createElement('canvas')
    out.width = art.width + pad * 2
    out.height = art.height + pad * 2 + 50
    const ctx = out.getContext('2d')!
    ctx.fillStyle = '#FFF9F0'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.save()
    ctx.shadowColor = 'rgba(43,20,83,0.28)'
    ctx.shadowBlur = 50
    ctx.shadowOffsetY = 24
    ctx.drawImage(art, pad, pad)
    ctx.restore()
    ctx.fillStyle = '#6E6578'
    ctx.font = '600 22px Manrope, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Concept preview · ${BUSINESS.name} · final specifications to be confirmed`, out.width / 2, out.height - pad / 2 - 6)
    out.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sri-ganapathy-${design.product}-concept.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }, [design, effectiveSide])

  const fields = describe(design)
  const waMessage = detailedMessage('I designed a concept in your website customizer and would like to discuss printing it. Please share the available options.', [
    ...fields,
    ['Notes', note],
  ])

  const flip = effectiveSide === 'back' ? 180 : 0
  const reduced = prefersReducedMotion()
  const cardStyle = {
    '--rx': `${rot.x}deg`,
    '--ry': `${rot.y}deg`,
    '--flip': `${flip}deg`,
    '--gl': `${(rot.y * 0.6).toFixed(1)}deg`,
    '--gx': `${(rot.y * -0.8).toFixed(1)}%`,
    width: `min(100%, calc(min(26rem, 52vh) * ${aspect.toFixed(4)}))`,
    aspectRatio: aspect.toFixed(4),
  } as CSSProperties

  return (
    <section id="customize" aria-labelledby="customize-title" className="section relative overflow-hidden bg-[linear-gradient(180deg,#FFF9F0,#F6EAF0_50%,#FFF9F0)]">
      <div className="wrap">
        <div className="reveal max-w-[46rem]">
          <p className="eyebrow">Design studio</p>
          <h2 id="customize-title" className="h-section mt-5">
            Imagine It. Customize It. <span className="italic text-violet">Print It.</span>
          </h2>
          <p className="lede mt-5">Try a product, colour, typeface and finish. When you like what you see, send it to us as a starting point.</p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* Preview */}
          <div className="reveal lg:sticky lg:top-24 lg:self-start">
            <div className="grain relative overflow-hidden rounded-[2rem] bg-[radial-gradient(70%_70%_at_50%_40%,#FFFFFF,#EFE3EA)] shadow-paper">
              <div
                className="cz-stage flex h-[min(34rem,68vh)] min-h-[22rem] cursor-grab items-center justify-center p-8 active:cursor-grabbing"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKey}
                tabIndex={0}
                role="img"
                aria-label={`Preview: ${fields.map(([k, v]) => `${k} ${v}`).join(', ')}, ${effectiveSide} side. Drag or use the arrow keys to rotate.`}
              >
                <div className={`cz-card ${dragging || reduced ? 'is-dragging' : ''}`} style={cardStyle}>
                  <div className="cz-edge" />
                  <Face design={design} side="front" refreshKey={fontsKey} />
                  {back && <Face design={design} side="back" refreshKey={fontsKey} />}
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-plum/10 bg-white/60 px-5 py-3 backdrop-blur">
                <span className="text-[0.78rem] font-medium text-ink-mute">Drag to rotate · {effectiveSide === 'back' ? 'Back' : 'Front'}</span>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setRot((r) => ({ ...r, y: r.y - 30 }))} aria-label="Rotate left">
                    <RotateCcw width={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
                    disabled={!back}
                    title={back ? undefined : 'This product is single-sided in the preview'}
                    aria-pressed={effectiveSide === 'back'}
                  >
                    <Flip width={16} /> {effectiveSide === 'back' ? 'Show front' : 'Show back'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={download}>
                    <Download width={16} /> Download
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-4 px-1 text-[0.82rem] leading-relaxed text-ink-mute">
              This preview is a concept to help you describe what you want — not a proof of the printed result. Paper, colours and available finishes
              (including foil) must be confirmed with {BUSINESS.name} before printing.
            </p>
          </div>

          {/* Controls */}
          <div className="reveal space-y-7" style={{ '--d': '120ms' } as CSSProperties}>
            <Options name="cz-product" legend="Product" value={design.product} options={PRODUCTS} onChange={set('product')} />
            <Options name="cz-bg" legend="Background colour" value={design.background} options={BACKGROUNDS} onChange={set('background')} swatches />
            <Options name="cz-type" legend="Typography" value={design.typeface} options={TYPEFACES} onChange={set('typeface')} />
            <Options name="cz-finish" legend="Finish" value={design.finish} options={FINISHES} onChange={set('finish')} />
            <Options name="cz-orient" legend="Orientation" value={design.orientation} options={ORIENTATIONS} onChange={set('orientation')} />
            <div>
              <label htmlFor="cz-note" className="field-label">Anything to add? <span className="font-medium normal-case tracking-normal text-ink-mute">(optional)</span></label>
              <input id="cz-note" className="field" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. quantity, names, occasion" />
            </div>
            <div className="flex flex-wrap gap-3 border-t border-plum/10 pt-7">
              <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <WhatsApp width={18} /> Request This Design
              </a>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => prefillEnquiry({
                  service: design.product === 'visiting-card' ? 'Visiting Cards' : design.product === 'invitation' ? 'Invitation Printing' : design.product === 'letterhead' ? 'Letterheads' : design.product === 'calendar' ? 'Monthly Calendars' : 'Diary Printing',
                  requirements: fields.map(([k, v]) => `${k}: ${v}`).join(' · '),
                  message: note,
                })}
              >
                Add to enquiry form
              </button>
              <button type="button" className="btn btn-sm self-center text-ink-mute hover:text-plum" onClick={reset}>
                <RotateCcw width={15} /> Reset design
              </button>
            </div>
            <p className="text-[0.8rem] text-ink-mute">“Request This Design” opens WhatsApp with your choices written out — you can review the message before sending.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// The customizer's artwork, drawn on canvas so the live preview and the downloadable
// image are the same picture. Every design is a concept with placeholder text.

export type Product = 'visiting-card' | 'invitation' | 'letterhead' | 'calendar' | 'diary'
export type Background = 'ivory' | 'plum' | 'blush' | 'black'
export type Typeface = 'serif' | 'sans' | 'classic'
export type Finish = 'matte' | 'glossy' | 'foil'
export type Orientation = 'portrait' | 'landscape'
export type Side = 'front' | 'back'

export interface Design {
  product: Product
  background: Background
  typeface: Typeface
  finish: Finish
  orientation: Orientation
}

export const DEFAULT_DESIGN: Design = {
  product: 'visiting-card',
  background: 'ivory',
  typeface: 'serif',
  finish: 'foil',
  orientation: 'landscape',
}

export const PRODUCTS: { id: Product; label: string; hasBack: boolean }[] = [
  { id: 'visiting-card', label: 'Visiting Card', hasBack: true },
  { id: 'invitation', label: 'Invitation', hasBack: true },
  { id: 'letterhead', label: 'Letterhead', hasBack: false },
  { id: 'calendar', label: 'Calendar', hasBack: false },
  { id: 'diary', label: 'Diary', hasBack: true },
]
export const BACKGROUNDS: { id: Background; label: string; swatch: string }[] = [
  { id: 'ivory', label: 'Ivory', swatch: '#FFF9F0' },
  { id: 'plum', label: 'Royal Purple', swatch: '#402078' },
  { id: 'blush', label: 'Blush', swatch: '#F3DCE3' },
  { id: 'black', label: 'Black', swatch: '#211D28' },
]
export const TYPEFACES: { id: Typeface; label: string; css: string }[] = [
  { id: 'serif', label: 'Elegant Serif', css: '"Playfair Display", serif' },
  { id: 'sans', label: 'Modern Sans', css: 'Manrope, sans-serif' },
  { id: 'classic', label: 'Classic', css: 'Cinzel, serif' },
]
export const FINISHES: { id: Finish; label: string }[] = [
  { id: 'matte', label: 'Matte' },
  { id: 'glossy', label: 'Glossy' },
  { id: 'foil', label: 'Foil-Inspired' },
]
export const ORIENTATIONS: { id: Orientation; label: string }[] = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'landscape', label: 'Landscape' },
]

export const hasBack = (p: Product) => PRODUCTS.find((x) => x.id === p)!.hasBack

/** Width ÷ height of the finished piece. */
export function aspectOf(d: Design): number {
  const portrait: Record<Product, number> = {
    'visiting-card': 1 / 1.75,
    invitation: 5 / 7,
    letterhead: 1 / Math.SQRT2,
    calendar: 3 / 4,
    diary: 0.7,
  }
  const a = portrait[d.product]
  return d.orientation === 'portrait' ? a : 1 / a
}

/** Fonts the canvas needs — loaded before drawing, so the preview isn't in a fallback face. */
export const CANVAS_FONTS = [
  'italic 500 40px "Playfair Display"',
  '700 40px Manrope',
  '500 40px Manrope',
  '600 40px Cinzel',
  '400 40px Cinzel',
  'italic 400 40px "Cormorant Garamond"',
  '400 40px "Cormorant Garamond"',
]

interface Palette {
  bg: [string, string]
  text: string
  soft: string
  accent: string
  faint: string
}

const PALETTES: Record<Background, Palette> = {
  ivory: { bg: ['#FFFDF8', '#F5EBDD'], text: '#211D28', soft: '#6E6578', accent: '#402078', faint: 'rgba(64,32,120,0.12)' },
  plum: { bg: ['#55289A', '#2B1453'], text: '#FFF9F0', soft: 'rgba(255,249,240,0.72)', accent: '#E8D3A6', faint: 'rgba(255,249,240,0.16)' },
  blush: { bg: ['#F8E7EC', '#ECCAD6'], text: '#402078', soft: '#6E4F63', accent: '#6A35B4', faint: 'rgba(64,32,120,0.14)' },
  black: { bg: ['#2A2433', '#17141D'], text: '#FFF9F0', soft: 'rgba(255,249,240,0.66)', accent: '#C8A56A', faint: 'rgba(255,249,240,0.14)' },
}

type Mode = 'color' | 'foil'

class Painter {
  readonly u: number
  private pal: Palette
  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly W: number,
    readonly H: number,
    readonly d: Design,
    readonly mode: Mode,
  ) {
    this.u = Math.min(W, H) / 100
    this.pal = PALETTES[d.background]
  }

  get foil() { return this.d.finish === 'foil' }

  /** Accent fill: a gold gradient when foil is chosen, else the palette accent. */
  accentStyle(): string | CanvasGradient {
    if (this.mode === 'foil') return '#fff'
    if (!this.foil) return this.pal.accent
    const g = this.ctx.createLinearGradient(0, 0, this.W, this.H)
    const dark = this.d.background === 'ivory' || this.d.background === 'blush'
    g.addColorStop(0, dark ? '#8E6C35' : '#B48F52')
    g.addColorStop(0.45, dark ? '#C8A56A' : '#F4E6C4')
    g.addColorStop(0.55, dark ? '#B48F52' : '#E8D3A6')
    g.addColorStop(1, dark ? '#7F622E' : '#C8A56A')
    return g
  }

  /** Non-accent drawing is skipped on the foil mask. */
  get inColor() { return this.mode === 'color' }

  background() {
    const { ctx, W, H } = this
    if (this.mode === 'foil') {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      return
    }
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, this.pal.bg[0])
    g.addColorStop(1, this.pal.bg[1])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    // faint paper tooth
    let s = 7
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < (W * H) / 400; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(40,30,20,0.04)'
      ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1)
    }
  }

  font(kind: 'head' | 'body' | 'caps' | 'num', size: number): string {
    const t = this.d.typeface
    const px = `${Math.round(size)}px`
    switch (kind) {
      case 'head':
        return t === 'serif' ? `italic 500 ${px} "Playfair Display", serif` : t === 'sans' ? `700 ${px} Manrope, sans-serif` : `600 ${px} Cinzel, serif`
      case 'body':
        return t === 'sans' ? `500 ${px} Manrope, sans-serif` : t === 'serif' ? `italic 400 ${px} "Cormorant Garamond", serif` : `400 ${px} "Cormorant Garamond", serif`
      case 'caps':
        return t === 'classic' ? `600 ${px} Cinzel, serif` : `700 ${px} Manrope, sans-serif`
      case 'num':
        return t === 'sans' ? `600 ${px} Manrope, sans-serif` : t === 'serif' ? `500 ${px} "Playfair Display", serif` : `400 ${px} Cinzel, serif`
    }
  }

  /** Text, shrunk if needed to fit `maxW`, with optional tracking (for small caps). */
  text(str: string, x: number, y: number, o: { kind: 'head' | 'body' | 'caps' | 'num'; size: number; color: 'text' | 'soft' | 'accent'; align?: CanvasTextAlign; maxW?: number; track?: number }) {
    if (o.color !== 'accent' && !this.inColor) return
    const { ctx } = this
    let size = o.size
    const track = (o.track ?? 0) * this.u
    const measure = () => {
      ctx.font = this.font(o.kind, size)
      return ctx.measureText(str).width + track * (str.length - 1)
    }
    if (o.maxW) while (measure() > o.maxW && size > 6) size *= 0.94
    else measure()
    ctx.fillStyle = o.color === 'accent' ? this.accentStyle() : this.pal[o.color]
    ctx.textBaseline = 'alphabetic'
    if (!track) {
      ctx.textAlign = o.align ?? 'left'
      ctx.fillText(str, x, y)
      return
    }
    const w = measure()
    let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x
    ctx.textAlign = 'left'
    for (const ch of str) {
      ctx.fillText(ch, cx, y)
      cx += ctx.measureText(ch).width + track
    }
  }

  rule(x: number, y: number, w: number, h = this.u * 0.35) {
    this.ctx.fillStyle = this.accentStyle()
    this.ctx.fillRect(x, y, w, h)
  }

  frame(inset: number, width = this.u * 0.35) {
    this.ctx.strokeStyle = this.accentStyle()
    this.ctx.lineWidth = width
    this.ctx.strokeRect(inset, inset, this.W - inset * 2, this.H - inset * 2)
  }

  lines(x: number, y: number, w: number, n: number, gap: number) {
    if (!this.inColor) return
    this.ctx.fillStyle = this.pal.faint
    for (let i = 0; i < n; i++) this.ctx.fillRect(x, y + i * gap, w * (i === n - 1 ? 0.55 : 0.88 + ((i * 37) % 12) / 100), Math.max(1, this.u * 0.45))
  }

  monogram(cx: number, cy: number, r: number, letters = 'YN') {
    const { ctx } = this
    ctx.strokeStyle = this.accentStyle()
    ctx.lineWidth = Math.max(1.5, r * 0.06)
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    this.text(letters, cx, cy + r * 0.32, { kind: 'head', size: r * 0.92, color: 'accent', align: 'center' })
  }

  diamond(x: number, y: number, r: number) {
    const { ctx } = this
    ctx.fillStyle = this.accentStyle()
    ctx.beginPath()
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y)
    ctx.closePath()
    ctx.fill()
  }
}

function visitingCard(p: Painter, side: Side) {
  const { W, H, u } = p
  const land = W > H
  if (side === 'back') {
    p.monogram(W / 2, H * (land ? 0.42 : 0.4), u * (land ? 16 : 18))
    p.text('Your Business', W / 2, H * (land ? 0.78 : 0.68), { kind: 'caps', size: u * 4.6, color: 'text', align: 'center', track: 0.9, maxW: W * 0.8 })
    p.text('your tagline here', W / 2, H * (land ? 0.87 : 0.75), { kind: 'body', size: u * 5, color: 'soft', align: 'center' })
    return
  }
  if (land) {
    p.monogram(W * 0.17, H * 0.36, u * 10)
    p.text('Your Name', W * 0.08, H * 0.7, { kind: 'head', size: u * 13, color: 'text', maxW: W * 0.6 })
    p.text('DESIGNATION', W * 0.08, H * 0.81, { kind: 'caps', size: u * 3.6, color: 'accent', track: 1.1 })
    p.rule(W * 0.08, H * 0.86, W * 0.08)
    p.text('+91 00000 00000', W * 0.92, H * 0.3, { kind: 'body', size: u * 5, color: 'soft', align: 'right' })
    p.text('you@example.com', W * 0.92, H * 0.41, { kind: 'body', size: u * 5, color: 'soft', align: 'right' })
    p.text('Your Business', W * 0.92, H * 0.52, { kind: 'body', size: u * 5, color: 'soft', align: 'right' })
  } else {
    p.monogram(W / 2, H * 0.2, u * 13)
    p.text('Your Name', W / 2, H * 0.46, { kind: 'head', size: u * 14, color: 'text', align: 'center', maxW: W * 0.84 })
    p.text('DESIGNATION', W / 2, H * 0.52, { kind: 'caps', size: u * 4.2, color: 'accent', align: 'center', track: 1.1 })
    p.rule(W / 2 - u * 8, H * 0.56, u * 16)
    p.text('+91 00000 00000', W / 2, H * 0.78, { kind: 'body', size: u * 6, color: 'soft', align: 'center' })
    p.text('you@example.com', W / 2, H * 0.84, { kind: 'body', size: u * 6, color: 'soft', align: 'center' })
    p.text('Your Business', W / 2, H * 0.9, { kind: 'body', size: u * 6, color: 'soft', align: 'center' })
  }
}

function invitation(p: Painter, side: Side) {
  const { W, H, u } = p
  const land = W > H
  p.frame(u * 4, u * 0.5)
  p.frame(u * 6, u * 0.2)
  for (const [x, y] of [[u * 6, u * 6], [W - u * 6, u * 6], [u * 6, H - u * 6], [W - u * 6, H - u * 6]]) p.diamond(x, y, u * 1.4)
  if (side === 'back') {
    p.monogram(W / 2, H * 0.36, u * 14, 'B&G')
    p.text('With love and blessings', W / 2, H * 0.62, { kind: 'body', size: u * 6, color: 'soft', align: 'center' })
    p.text('RSVP · +91 00000 00000', W / 2, H * 0.74, { kind: 'caps', size: u * 3.4, color: 'text', align: 'center', track: 0.8, maxW: W * 0.8 })
    return
  }
  const cy = land ? 0.06 : 0
  p.text('TOGETHER WITH THEIR FAMILIES', W / 2, H * (0.19 + cy), { kind: 'caps', size: u * 3.2, color: 'text', align: 'center', track: 1, maxW: W * 0.78 })
  if (land) {
    p.text('Bride', W * 0.3, H * 0.5, { kind: 'head', size: u * 15, color: 'text', align: 'center', maxW: W * 0.34 })
    p.text('&', W / 2, H * 0.5, { kind: 'head', size: u * 14, color: 'accent', align: 'center' })
    p.text('Groom', W * 0.7, H * 0.5, { kind: 'head', size: u * 15, color: 'text', align: 'center', maxW: W * 0.34 })
  } else {
    p.text('Bride', W / 2, H * 0.35, { kind: 'head', size: u * 17, color: 'text', align: 'center', maxW: W * 0.8 })
    p.text('&', W / 2, H * 0.45, { kind: 'head', size: u * 13, color: 'accent', align: 'center' })
    p.text('Groom', W / 2, H * 0.56, { kind: 'head', size: u * 17, color: 'text', align: 'center', maxW: W * 0.8 })
  }
  p.text('request the pleasure of your company', W / 2, H * (land ? 0.66 : 0.66), { kind: 'body', size: u * 5.6, color: 'soft', align: 'center', maxW: W * 0.8 })
  p.rule(W / 2 - u * 7, H * (land ? 0.72 : 0.71), u * 14)
  p.text('DATE · TIME · VENUE', W / 2, H * (land ? 0.82 : 0.8), { kind: 'caps', size: u * 3.4, color: 'text', align: 'center', track: 1 })
}

function letterhead(p: Painter) {
  const { W, H, u } = p
  const m = u * 8
  p.monogram(m + u * 5, m + u * 4, u * 5)
  p.text('Your Organisation', m + u * 13, m + u * 5.5, { kind: 'head', size: u * 6.4, color: 'text', maxW: W * 0.5 })
  p.text('+91 00000 00000', W - m, m + u * 2, { kind: 'body', size: u * 3.2, color: 'soft', align: 'right' })
  p.text('you@example.com', W - m, m + u * 6, { kind: 'body', size: u * 3.2, color: 'soft', align: 'right' })
  p.rule(m, m + u * 11, W - m * 2, u * 0.3)
  p.lines(m, m + u * 22, W - m * 2, Math.floor((H - m * 2 - u * 34) / (u * 5.2)), u * 5.2)
  p.rule(0, H - u * 4, W, u * 4)
  p.text('Address line · City', W / 2, H - u * 7.5, { kind: 'caps', size: u * 2.3, color: 'soft', align: 'center', track: 0.6 })
}

function calendar(p: Painter) {
  const { W, H, u } = p
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()
  const land = W > H
  const m = u * 7
  p.text(now.toLocaleDateString('en-IN', { month: 'long' }), m, m + u * 9, { kind: 'head', size: u * 11, color: 'text' })
  p.text(String(y), W - m, m + u * 9, { kind: 'num', size: u * 7, color: 'accent', align: 'right' })
  p.rule(m, m + u * 13, W - m * 2)
  const top = m + u * 20
  const bottom = H - u * 14
  const gw = W - m * 2
  const first = new Date(y, mo, 1).getDay()
  const days = new Date(y, mo + 1, 0).getDate()
  const rows = Math.ceil((first + days) / 7)
  const cw = gw / 7
  const rh = (bottom - top - u * 6) / rows
  'SMTWTFS'.split('').forEach((d, i) => p.text(d, m + cw * (i + 0.5), top, { kind: 'caps', size: u * 3, color: i === 0 ? 'accent' : 'soft', align: 'center' }))
  for (let d = 1; d <= days; d++) {
    const i = first + d - 1
    const col = i % 7
    const row = Math.floor(i / 7)
    p.text(String(d), m + cw * (col + 0.5), top + u * 7 + row * rh, {
      kind: 'num', size: Math.min(u * (land ? 5 : 5.6), rh * 0.6), color: col === 0 ? 'accent' : d === now.getDate() ? 'accent' : 'text', align: 'center',
    })
  }
  p.rule(0, H - u * 10, W, u * 10)
  // The business name sits in the band, knocked out of the accent colour.
  if (p.inColor) {
    const light = p.d.background === 'plum' || p.d.background === 'black'
    p.ctx.fillStyle = light ? '#211D28' : '#FFF9F0'
    p.ctx.font = p.font('caps', u * 3.2)
    p.ctx.textAlign = 'center'
    p.ctx.fillText('YOUR BUSINESS · YOUR CONTACT', W / 2, H - u * 3.8)
  }
}

function diary(p: Painter, side: Side) {
  const { W, H, u } = p
  const now = new Date()
  const year = now.getMonth() >= 8 ? now.getFullYear() + 1 : now.getFullYear()
  p.frame(u * 6, u * 0.4)
  if (side === 'back') {
    p.monogram(W / 2, H * 0.8, u * 7)
    p.text('Your Business', W / 2, H * 0.92, { kind: 'caps', size: u * 3, color: 'soft', align: 'center', track: 0.8 })
    return
  }
  p.text(String(year), W / 2, H * 0.42, { kind: 'num', size: u * 22, color: 'accent', align: 'center' })
  p.text('DIARY', W / 2, H * 0.52, { kind: 'caps', size: u * 5, color: 'text', align: 'center', track: 2 })
  p.rule(W / 2 - u * 8, H * 0.57, u * 16)
  p.text('Your Business', W / 2, H * 0.84, { kind: 'head', size: u * 7, color: 'text', align: 'center', maxW: W * 0.7 })
}

/** Paints `side` of design `d` across the whole canvas. */
export function drawDesign(canvas: HTMLCanvasElement, d: Design, side: Side, mode: Mode = 'color', longSide = 1100) {
  const a = aspectOf(d)
  const W = Math.round(a >= 1 ? longSide : longSide * a)
  const H = Math.round(a >= 1 ? longSide / a : longSide)
  if (canvas.width !== W) canvas.width = W
  if (canvas.height !== H) canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, W, H)
  const p = new Painter(ctx, W, H, d, mode)
  p.background()
  switch (d.product) {
    case 'visiting-card': visitingCard(p, side); break
    case 'invitation': invitation(p, side); break
    case 'letterhead': letterhead(p); break
    case 'calendar': calendar(p); break
    case 'diary': diary(p, side); break
  }
}

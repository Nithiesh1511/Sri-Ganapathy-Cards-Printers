// Drawing helpers shared by the showroom's printed products. The products carry
// the shop's own mark as sample artwork (or neutral "your name here" copy), so
// each model reads as a real print job rather than a blank prop.

type Ctx = CanvasRenderingContext2D

export const COLORS = {
  paper: '#FFF6EE',
  cream: '#FFFBF4',
  ink: '#16121E',
  iris: '#4B2BB8',
  irisDeep: '#231463',
  vermilion: '#D8221F',
  gold: '#D9AD43',
  cy: '#00AEEF',
  mg: '#EC008C',
  ye: '#FFD400',
}

export const F = {
  display: (px: number, italic = false, weight = 600) => `${italic ? 'italic ' : ''}${weight} ${px}px Fraunces, Georgia, serif`,
  sans: (px: number, weight = 700) => `${weight} ${px}px Manrope, system-ui, sans-serif`,
  mono: (px: number, weight = 500) => `${weight} ${px}px "IBM Plex Mono", ui-monospace, monospace`,
}

const BLADE = new Path2D('M0 -46 Q24 -42 30 -20 Q14 -34 -4 -30 Z')
const MONOGRAM = new Path2D('M-9 -8 C-17 -2 -14 12 -2 13 C8 14 13 7 11 1 L1 1')
const INKS = ['#16121E', '#00AEEF', '#EC008C', '#FFD400']

/** The shop's pinwheel mark, in full colour, centred at (cx, cy) with outer radius r. */
export function pinwheel(ctx: Ctx, cx: number, cy: number, r: number) {
  const k = r / 46
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(k, k)
  for (let i = 0; i < 12; i++) {
    ctx.save()
    ctx.rotate((i * 30 * Math.PI) / 180)
    ctx.fillStyle = INKS[i % 4]
    ctx.fill(BLADE)
    ctx.restore()
  }
  const g = ctx.createRadialGradient(-12, -14, 2, 0, 0, 36)
  g.addColorStop(0, '#6A47D6'); g.addColorStop(1, '#1C0F52')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(0, 0, 33, 0, Math.PI * 2); ctx.fill()
  const gold = ctx.createLinearGradient(-20, -20, 20, 20)
  gold.addColorStop(0, '#F7E2A1'); gold.addColorStop(1, '#C8962E')
  ctx.strokeStyle = gold
  ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.stroke()
  ctx.lineWidth = 4.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.stroke(MONOGRAM)
  ctx.fillStyle = gold
  ctx.beginPath(); ctx.arc(-1, -17, 2.1, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

/** Plain-colour pinwheel in a single ink (for foil / stamps / embossing). */
export function pinwheelMono(ctx: Ctx, cx: number, cy: number, r: number, color: string) {
  const k = r / 46
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(k, k)
  ctx.fillStyle = color
  for (let i = 0; i < 12; i++) {
    ctx.save()
    ctx.rotate((i * 30 * Math.PI) / 180)
    ctx.fill(BLADE)
    ctx.restore()
  }
  ctx.beginPath(); ctx.arc(0, 0, 33, 0, Math.PI * 2); ctx.fill()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineWidth = 4.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.strokeStyle = '#000'
  ctx.stroke(MONOGRAM)
  ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.lineWidth = 1.4; ctx.stroke()
  ctx.restore()
}

/** Text along a circle (for seals and stamps). Angles in radians, clockwise from the top. */
export function circleText(ctx: Ctx, text: string, cx: number, cy: number, radius: number, start: number, end: number, flip = false) {
  const n = text.length
  for (let i = 0; i < n; i++) {
    const a = start + ((end - start) * (i + 0.5)) / n
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(a)
    ctx.translate(0, flip ? radius : -radius)
    if (flip) ctx.rotate(Math.PI)
    ctx.textAlign = 'center'
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }
}

/** A dot-screen halftone block. */
export function halftone(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, pitch: number, angle = 0.4, dir: 'x' | 'y' | 'r' = 'x') {
  ctx.save()
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
  ctx.fillStyle = color
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const span = Math.hypot(w, h)
  const cx = x + w / 2, cy = y + h / 2
  for (let a = -span; a < span; a += pitch) {
    for (let b = -span; b < span; b += pitch) {
      const px = cx + a * cos - b * sin, py = cy + a * sin + b * cos
      if (px < x - pitch || px > x + w + pitch || py < y - pitch || py > y + h + pitch) continue
      const t = dir === 'x' ? (px - x) / w : dir === 'y' ? (py - y) / h : Math.hypot(px - cx, py - cy) / (span / 2)
      const r = pitch * 0.52 * Math.min(1, Math.max(0, t))
      if (r < 0.5) continue
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()
}

export function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, color = COLORS.ink, seed = 5) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  ctx.fillStyle = color
  let cx = x
  while (cx < x + w - 2) {
    const bw = 1 + Math.floor(rnd() * 4)
    if (rnd() > 0.35) ctx.fillRect(cx, y, bw, h)
    cx += bw + 1 + Math.floor(rnd() * 2)
  }
}

/** Ruled lines (letterhead body copy, notebook pages, forms). */
export function rules(ctx: Ctx, x: number, y: number, w: number, count: number, gap: number, color = 'rgba(22,18,30,0.14)', lw = 2) {
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  for (let i = 0; i < count; i++) {
    ctx.beginPath(); ctx.moveTo(x, y + i * gap); ctx.lineTo(x + w, y + i * gap); ctx.stroke()
  }
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** Paper tooth: fine fibres and speckle. */
export function paperGrain(ctx: Ctx, w: number, h: number, strength = 1) {
  let s = 13
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = rnd() * w, y = rnd() * h
    ctx.fillStyle = `rgba(120,90,60,${0.018 * strength * (0.4 + rnd())})`
    ctx.fillRect(x, y, 1 + rnd() * 2, 1)
  }
}

/** Leather / rexin grain as a bump map: mid-grey with pebbled darker pits. */
export function leatherBump(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = '#9a9a9a'
  ctx.fillRect(0, 0, w, h)
  let s = 29
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < (w * h) / 55; i++) {
    const x = rnd() * w, y = rnd() * h, r = 1.2 + rnd() * 2.6
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(40,40,40,0.9)'); g.addColorStop(1, 'rgba(40,40,40,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
}

/** A mandala of layered petals — used on invitations and as a general "auspicious" ornament. */
export function mandala(ctx: Ctx, cx: number, cy: number, r: number, color: string, lw = 2) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lw
  const rings = [
    { n: 16, a: r * 1.0, b: r * 0.62, w: 0.14 },
    { n: 12, a: r * 0.78, b: r * 0.46, w: 0.2 },
    { n: 8, a: r * 0.55, b: r * 0.3, w: 0.3 },
  ]
  for (const ring of rings) {
    for (let i = 0; i < ring.n; i++) {
      ctx.save()
      ctx.rotate((i / ring.n) * Math.PI * 2)
      ctx.beginPath()
      ctx.moveTo(0, -ring.b)
      ctx.bezierCurveTo(r * ring.w, -(ring.b + ring.a) / 2, r * ring.w * 0.7, -ring.a * 0.92, 0, -ring.a)
      ctx.bezierCurveTo(-r * ring.w * 0.7, -ring.a * 0.92, -r * ring.w, -(ring.b + ring.a) / 2, 0, -ring.b)
      ctx.stroke()
      ctx.restore()
    }
  }
  ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(0, 0, r * 1.06, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()
}

/** A multi-line text helper with simple word wrapping. Returns the y after the last line. */
export function wrapText(ctx: Ctx, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y)
      line = w
      y += lineH
    } else line = t
  }
  if (line) { ctx.fillText(line, x, y); y += lineH }
  return y
}

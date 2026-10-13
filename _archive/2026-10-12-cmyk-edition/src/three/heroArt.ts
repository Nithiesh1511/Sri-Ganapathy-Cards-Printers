// The artwork for the hero's four ink plates.
//
// A print is built from four sheets — cyan, magenta, yellow and black (key) —
// each carrying only its own ink. Laid on top of each other, with the paper
// beneath, they mix like real inks do: cyan + magenta is violet, magenta +
// yellow is red, all three is near-black. Each function here draws ONE plate on
// a white ground, to be multiplied over the paper in 3D.

export type Channel = 'C' | 'M' | 'Y' | 'K'

/** The finished visiting card, in scene units. */
export const CARD_W = 3.5
export const CARD_H = 2.0
/** Each plate is a little larger than the card: that is where crop marks live. */
export const PLATE_W = 4.3
export const PLATE_H = 2.7
export const PX_PER_UNIT = 320
export const TEX_W = Math.round(PLATE_W * PX_PER_UNIT)
export const TEX_H = Math.round(PLATE_H * PX_PER_UNIT)

export const INK: Record<Channel, [number, number, number]> = {
  C: [0, 174, 239],
  M: [236, 0, 140],
  Y: [255, 212, 0],
  K: [22, 18, 30],
}
export const SCREEN_ANGLE: Record<Channel, number> = { C: 15, M: 75, Y: 0, K: 45 }

const MX = (PLATE_W - CARD_W) / 2
const MY = (PLATE_H - CARD_H) / 2

/** Pinwheel blades, in the logo's own −50…50 box. */
const BLADE = 'M0 -46 Q24 -42 30 -20 Q14 -34 -4 -30 Z'
const MONOGRAM = 'M-9 -8 C-17 -2 -14 12 -2 13 C8 14 13 7 11 1 L1 1'
const BLADE_INK: Channel[] = ['K', 'C', 'M', 'Y']

const rgba = (ch: Channel, a = 1) => {
  const [r, g, b] = INK[ch]
  return `rgba(${r},${g},${b},${a})`
}

type Ctx = CanvasRenderingContext2D

/** Draws text with extra letter-spacing (canvas letterSpacing is not universal yet). */
function spaced(ctx: Ctx, text: string, x: number, y: number, spacing: number) {
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
}

/** A halftone ribbon: dots on this plate's own screen angle, swelling left → right. */
function halftoneBand(ctx: Ctx, ch: Channel, x0: number, x1: number, y0: number, y1: number, pitch: number, gain: number) {
  const ang = (SCREEN_ANGLE[ch] * Math.PI) / 180
  const cos = Math.cos(ang), sin = Math.sin(ang)
  ctx.save()
  ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip()
  ctx.fillStyle = rgba(ch)
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  const span = Math.hypot(x1 - x0, y1 - y0)
  for (let a = -span; a < span; a += pitch) {
    for (let b = -span; b < span; b += pitch) {
      const x = cx + a * cos - b * sin
      const y = cy + a * sin + b * cos
      if (x < x0 - pitch || x > x1 + pitch || y < y0 - pitch || y > y1 + pitch) continue
      const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)))
      const fall = 1 - 0.25 * ((y - y0) / (y1 - y0))
      const r = pitch * 0.5 * Math.pow(t, 0.85) * fall * gain
      if (r < 0.4) continue
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.restore()
}

export function drawPlate(ctx: Ctx, ch: Channel, w: number, h: number) {
  const S = PX_PER_UNIT
  const X = (u: number) => (MX + u) * S
  const Y = (v: number) => (MY + v) * S
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  // ── Press-sheet furniture: crop marks, registration targets, colour bar, label.
  ctx.strokeStyle = rgba(ch)
  ctx.lineWidth = 3
  const gap = 0.05 * S, len = 0.2 * S
  for (const [cx, cy, dx, dy] of [[0, 0, -1, -1], [CARD_W, 0, 1, -1], [0, CARD_H, -1, 1], [CARD_W, CARD_H, 1, 1]] as const) {
    ctx.beginPath()
    ctx.moveTo(X(cx) + dx * gap, Y(cy)); ctx.lineTo(X(cx) + dx * (gap + len), Y(cy))
    ctx.moveTo(X(cx), Y(cy) + dy * gap); ctx.lineTo(X(cx), Y(cy) + dy * (gap + len))
    ctx.stroke()
  }
  const target = (tx: number, ty: number) => {
    const r = 0.075 * S
    ctx.lineWidth = 2.6
    ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(tx, ty, r * 0.4, 0, Math.PI * 2); ctx.fillStyle = rgba(ch); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(tx - r * 1.7, ty); ctx.lineTo(tx + r * 1.7, ty)
    ctx.moveTo(tx, ty - r * 1.7); ctx.lineTo(tx, ty + r * 1.7)
    ctx.stroke()
  }
  target(w / 2, MY * S * 0.5)
  target(w / 2, h - MY * S * 0.5)
  target(MX * S * 0.5, h / 2)
  target(w - MX * S * 0.5, h / 2)
  // tint ramp
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = rgba(ch, 1 - i * 0.24)
    ctx.fillRect(w - MX * S - (4 - i) * 0.17 * S, h - MY * S * 0.5 - 0.06 * S, 0.17 * S, 0.12 * S)
  }
  // Each plate prints its own name in its own slot along the bottom margin, so
  // the four read in a row once they are registered.
  ctx.fillStyle = rgba(ch)
  ctx.font = `500 ${0.074 * S}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textBaseline = 'middle'
  const LABEL_X: Record<Channel, number> = { C: 0, M: 0.42, Y: 0.98, K: 1.52 }
  const LABEL: Record<Channel, string> = { C: 'CYAN', M: 'MAGENTA', Y: 'YELLOW', K: 'KEY' }
  spaced(ctx, LABEL[ch], (MX + LABEL_X[ch]) * S, h - MY * S * 0.5, 0.008 * S)

  // ── The card itself ────────────────────────────────────────────────────────
  // Frame (key)
  if (ch === 'K') {
    ctx.strokeStyle = rgba('K', 0.9)
    ctx.lineWidth = 0.012 * S
    ctx.beginPath()
    ctx.roundRect(X(0.1), Y(0.1), CARD_W * S - 0.2 * S, CARD_H * S - 0.2 * S, 0.06 * S)
    ctx.stroke()
  }

  // Logo: pinwheel of process-ink blades, indigo disc (cyan + magenta mixed),
  // gold monogram (yellow + a little magenta, knocked out of the other plates).
  const lx = X(0.62), ly = Y(0.62)
  const k = (0.4 * S) / 46
  ctx.save()
  ctx.translate(lx, ly)
  ctx.scale(k, k)
  const blade = new Path2D(BLADE)
  for (let i = 0; i < 12; i++) {
    if (BLADE_INK[i % 4] !== ch) continue
    ctx.save()
    ctx.rotate((i * 30 * Math.PI) / 180)
    ctx.fillStyle = rgba(ch)
    ctx.fill(blade)
    ctx.restore()
  }
  const discTint: Record<Channel, number> = { C: 0.62, M: 0.92, Y: 0, K: 0.3 }
  if (discTint[ch] > 0) {
    ctx.fillStyle = rgba(ch, discTint[ch])
    ctx.beginPath(); ctx.arc(0, 0, 33, 0, Math.PI * 2); ctx.fill()
  }
  const mono = new Path2D(MONOGRAM)
  // knock the monogram and ring out of every plate…
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.lineWidth = 4.6; ctx.stroke(mono)
  ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.lineWidth = 1.7; ctx.stroke()
  // …then print gold back into it from yellow (full) and magenta (a touch)
  if (ch === 'Y' || ch === 'M') {
    const a = ch === 'Y' ? 0.95 : 0.26
    ctx.strokeStyle = rgba(ch, a)
    ctx.lineWidth = 4.4; ctx.stroke(mono)
    ctx.beginPath(); ctx.arc(0, 0, 29, 0, Math.PI * 2); ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(-1, -17, 2.1, 0, Math.PI * 2); ctx.fillStyle = rgba(ch, a); ctx.fill()
  }
  ctx.restore()

  // Name & details (key only)
  if (ch === 'K') {
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = rgba('K')
    ctx.font = `italic 600 ${0.27 * S}px Fraunces, Georgia, serif`
    ctx.fillText('Sri Ganapathy', X(0.3), Y(1.3))
    ctx.font = `800 ${0.092 * S}px Manrope, system-ui, sans-serif`
    spaced(ctx, 'CARDS & PRINTERS', X(0.31), Y(1.47), 0.03 * S)
    ctx.fillRect(X(0.31), Y(1.56), 1.45 * S, 0.012 * S)
    ctx.font = `800 ${0.098 * S}px Manrope, system-ui, sans-serif`
    ctx.fillText('93644 22577', X(0.31), Y(1.76))
    ctx.fillText('90036 84725', X(1.12), Y(1.76))
    ctx.font = `500 ${0.054 * S}px "IBM Plex Mono", ui-monospace, monospace`
    ctx.fillText('sriganapathycardsandprinters@gmail.com', X(0.31), Y(1.9))
  }

  // Process-colour chart: a tidy grid of swatches on the right of the card.
  // Each swatch is built the way a real print is — its CMYK components come off
  // the matching plates and mix where they land on top of one another. Primaries,
  // then their two-ink overlaps, then key, a tint and the house gold.
  type Mix = { c?: number; m?: number; y?: number; k?: number }
  const CHART: Mix[] = [
    { c: 1 },           { m: 1 },          { y: 1 },
    { m: 1, y: 1 },     { c: 1, y: 1 },    { c: 1, m: 1 },
    { k: 1 },           { k: 0.5 },        { y: 0.95, m: 0.26 },
  ]
  const comp = (mix: Mix) => (ch === 'C' ? mix.c : ch === 'M' ? mix.m : ch === 'Y' ? mix.y : mix.k) ?? 0
  const SW = 0.26, STEP = 0.315, GX = 2.33, GY = 0.42, RAD = 0.045 * S
  CHART.forEach((mix, i) => {
    const sx = X(GX + (i % 3) * STEP), sy = Y(GY + ((i / 3) | 0) * STEP), sz = SW * S
    const a = comp(mix)
    if (a > 0) {
      ctx.fillStyle = rgba(ch, Math.min(0.97, a * 0.97))
      ctx.beginPath(); ctx.roundRect(sx, sy, sz, sz, RAD); ctx.fill()
    }
    // The key plate gives every cell a crisp hairline, so even the lighter ones read.
    if (ch === 'K') {
      ctx.strokeStyle = rgba('K', 0.85); ctx.lineWidth = 0.009 * S
      ctx.beginPath(); ctx.roundRect(sx, sy, sz, sz, RAD); ctx.stroke()
    }
  })
  if (ch === 'K') {
    ctx.save()
    ctx.fillStyle = rgba('K')
    ctx.font = `600 ${0.056 * S}px "IBM Plex Mono", ui-monospace, monospace`
    ctx.textAlign = 'center'
    try { (ctx as unknown as { letterSpacing: string }).letterSpacing = `${0.012 * S}px` } catch { /* older canvas */ }
    ctx.fillText('PROCESS COLOUR', X(GX + STEP + SW / 2), Y(1.47))
    ctx.restore()
  }

  // Halftone ribbon along the bottom-right edge: three screens, three angles.
  if (ch !== 'K') {
    const gain = ch === 'C' ? 1.0 : ch === 'M' ? 0.9 : 0.8
    halftoneBand(ctx, ch, X(1.95), X(CARD_W - 0.02), Y(CARD_H - 0.26), Y(CARD_H - 0.02), 0.072 * S, gain * 1.25)
  }
}

/** The blank card stock the plates are printed on: warm white with a hint of fibre. */
export function drawPaper(ctx: Ctx, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#fffdf9')
  g.addColorStop(0.55, '#fff8ef')
  g.addColorStop(1, '#fbeee0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // fibres
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  ctx.lineWidth = 1
  for (let i = 0; i < 900; i++) {
    const x = rnd() * w, y = rnd() * h, l = 6 + rnd() * 20, a = rnd() * Math.PI
    ctx.strokeStyle = `rgba(150,110,80,${0.025 + rnd() * 0.035})`
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(140,100,70,0.12)'
  ctx.lineWidth = 2
  ctx.strokeRect(10, 10, w - 20, h - 20)
}

export interface BackdropTheme {
  bg: string
  glowA: string
  glowB: string
  glowC: string
  /** Dot colour as an rgba() prefix, e.g. 'rgba(150,108,30,' — alpha is appended. */
  dots: string
}

/**
 * The pool of light the plates are laid on: the sheet colour at the centre, melting
 * into the page by the edge. Transparent outside the glow, so it never leaves a visible
 * rectangle over the backdrop; the falloff is eased so there's no hard rim.
 */
export function drawLightPool(ctx: Ctx, w: number, h: number, sheet: string) {
  ctx.clearRect(0, 0, w, h)
  const n = parseInt(sheet.slice(1), 16)
  const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
  const stops: [number, number][] = [[0, 1], [0.28, 0.95], [0.48, 0.74], [0.66, 0.42], [0.82, 0.15], [1, 0]]
  for (const [o, a] of stops) g.addColorStop(o, `rgba(${rgb},${a})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

/** Soft radial blobs and a dot field, drawn once and used as the hero's backdrop. */
export function drawBackdrop(ctx: Ctx, w: number, h: number, th: BackdropTheme) {
  ctx.fillStyle = th.bg
  ctx.fillRect(0, 0, w, h)
  const glow = (x: number, y: number, r: number, c: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    // fade to the same colour at zero alpha, so dark pages don't pick up a grey haze
    g.addColorStop(0, c); g.addColorStop(1, c.replace(/[\d.]+\)$/, '0)'))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  glow(w * 0.72, h * 0.42, h * 0.75, th.glowA)
  glow(w * 0.92, h * 0.1, h * 0.55, th.glowB)
  glow(w * 0.12, h * 0.95, h * 0.6, th.glowC)
  // dot field, fading toward the left (where the headline sits)
  const pitch = 26
  for (let y = pitch / 2; y < h; y += pitch) {
    for (let x = pitch / 2; x < w; x += pitch) {
      const t = Math.max(0, (x / w - 0.25) / 0.75)
      const r = 1.2 + 3.2 * t * (0.6 + 0.4 * Math.sin(y / h * Math.PI))
      ctx.fillStyle = `${th.dots}${(0.05 + 0.1 * t).toFixed(3)})`
      ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill()
    }
  }
}

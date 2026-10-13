// Artwork for the hero's three cards, drawn on canvas. Each face is painted twice:
//   'color' — what you see;
//   'foil'  — white wherever there is foil, black elsewhere. The 3D scene turns this
//             into metalness, roughness and a slight raised bump, so foil catches light.

export type FaceId = 'brand-front' | 'brand-back' | 'invite-front' | 'invite-back' | 'minimal-front' | 'minimal-back'
type Mode = 'color' | 'foil'

export const ART_W = 1024
export const ART_H = 585 // 1.75 : 1, a standard visiting card

const PLUM = '#402078'
const PLUM_FOIL = '#4E2690'
const GOLD = '#C8A56A'
const INK = '#211D28'

const SERIF = '"Cormorant Garamond", Georgia, serif'
const PLAYFAIR = '"Playfair Display", Georgia, serif'
const SANS = 'Manrope, system-ui, sans-serif'

/** Text with tracking (canvas letterSpacing isn't everywhere yet). */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: 'center' | 'left' = 'center') {
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1)
  let cx = align === 'center' ? x - total / 2 : x
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  ;[...text].forEach((ch, i) => {
    ctx.fillText(ch, cx, y)
    cx += widths[i] + tracking
  })
  ctx.textAlign = prev
}

function paperBase(ctx: CanvasRenderingContext2D, mode: Mode, from: string, to: string, seed: number) {
  if (mode === 'foil') {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, ART_W, ART_H)
    return
  }
  const g = ctx.createLinearGradient(0, 0, ART_W, ART_H)
  g.addColorStop(0, from)
  g.addColorStop(1, to)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ART_W, ART_H)
  // Paper fibre: a scatter of faint flecks (seeded, so a redraw looks the same).
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(60,40,20,0.05)'
    ctx.fillRect(rnd() * ART_W, rnd() * ART_H, 1 + rnd() * 2.5, 1)
  }
}

/** Fill style for something that is foil: its colour, or white on the foil mask. */
const foil = (mode: Mode, color: string) => (mode === 'foil' ? '#fff' : color)
/** Something that isn't foil: drawn in colour only. */
const plain = (mode: Mode) => mode === 'color'

function keyline(ctx: CanvasRenderingContext2D, mode: Mode, inset: number, color: string, width = 2) {
  ctx.strokeStyle = foil(mode, color)
  ctx.lineWidth = width
  ctx.strokeRect(inset, inset, ART_W - inset * 2, ART_H - inset * 2)
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r, y)
  ctx.closePath()
  ctx.fill()
}

const PAINTERS: Record<FaceId, (ctx: CanvasRenderingContext2D, mode: Mode) => void> = {
  // The hero card: ivory stock, the name in royal purple foil.
  'brand-front'(ctx, mode) {
    paperBase(ctx, mode, '#FFFDF8', '#F3E8D8', 11)
    keyline(ctx, mode, 34, GOLD, 2)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = foil(mode, GOLD)
    diamond(ctx, ART_W / 2, 150, 9)
    ctx.fillStyle = foil(mode, PLUM_FOIL)
    ctx.font = `italic 600 136px ${SERIF}`
    ctx.fillText('Sri Ganapathy', ART_W / 2, 298)
    if (plain(mode)) {
      ctx.fillStyle = INK
      ctx.font = `700 25px ${SANS}`
      spaced(ctx, 'CARDS & PRINTERS', ART_W / 2, 356, 11)
    }
    ctx.fillStyle = foil(mode, GOLD)
    ctx.fillRect(ART_W / 2 - 70, 392, 140, 2)
    if (plain(mode)) {
      ctx.fillStyle = '#4A4354'
      ctx.font = `500 25px ${SANS}`
      spaced(ctx, '93644 22577   ·   90036 84725', ART_W / 2, 470, 2)
    }
  },
  'brand-back'(ctx, mode) {
    paperBase(ctx, mode, '#4E2690', '#24103F', 23)
    keyline(ctx, mode, 34, GOLD, 1.5)
    ctx.textAlign = 'center'
    ctx.strokeStyle = foil(mode, GOLD)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(ART_W / 2, 230, 92, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = foil(mode, GOLD)
    ctx.font = `italic 600 150px ${SERIF}`
    ctx.fillText('G', ART_W / 2 - 4, 280)
    if (plain(mode)) {
      ctx.fillStyle = '#F3E9F7'
      ctx.font = `italic 500 44px ${SERIF}`
      ctx.fillText('Your Ideas. Beautifully Printed.', ART_W / 2, 425)
    }
  },
  // An invitation card: blush stock, gold foil border and ampersand.
  'invite-front'(ctx, mode) {
    paperBase(ctx, mode, '#FBEFF2', '#ECCFD9', 37)
    keyline(ctx, mode, 26, GOLD, 2.5)
    keyline(ctx, mode, 40, GOLD, 1)
    ctx.fillStyle = foil(mode, GOLD)
    for (const [x, y] of [[40, 40], [ART_W - 40, 40], [40, ART_H - 40], [ART_W - 40, ART_H - 40]]) diamond(ctx, x, y, 10)
    ctx.textAlign = 'center'
    if (plain(mode)) {
      ctx.fillStyle = PLUM
      ctx.font = `700 18px ${SANS}`
      spaced(ctx, 'TOGETHER WITH THEIR FAMILIES', ART_W / 2, 140, 7)
      ctx.font = `italic 500 80px ${PLAYFAIR}`
      ctx.textAlign = 'right'
      ctx.fillText('Ananya', ART_W / 2 - 52, 290)
      ctx.textAlign = 'left'
      ctx.fillText('Karthik', ART_W / 2 + 52, 290)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#4A4354'
      ctx.font = `italic 500 34px ${SERIF}`
      ctx.fillText('request the pleasure of your company', ART_W / 2, 412)
    }
    ctx.fillStyle = foil(mode, GOLD)
    ctx.font = `italic 400 120px ${PLAYFAIR}`
    ctx.fillText('&', ART_W / 2 + 4, 300)
    ctx.fillRect(ART_W / 2 - 50, 452, 100, 2)
  },
  'invite-back'(ctx, mode) {
    paperBase(ctx, mode, '#F6E3E9', '#E7C2CF', 41)
    ctx.strokeStyle = foil(mode, GOLD)
    const cx = ART_W / 2
    const cy = ART_H / 2
    ctx.lineWidth = 2
    for (const r of [60, 120, 150]) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    for (let i = 0; i < 16; i++) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((i / 16) * Math.PI * 2)
      ctx.beginPath()
      ctx.ellipse(0, -90, 13, 30, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    ctx.fillStyle = foil(mode, GOLD)
    diamond(ctx, cx, cy, 14)
  },
  // A minimalist card: ink-black stock, ivory type, one gold rule.
  'minimal-front'(ctx, mode) {
    paperBase(ctx, mode, '#2A2433', '#17141D', 53)
    ctx.textAlign = 'left'
    if (plain(mode)) {
      ctx.fillStyle = '#FFF9F0'
      ctx.font = `600 84px ${SERIF}`
      ctx.fillText('Your Name', 90, 250)
      ctx.fillStyle = 'rgba(255,249,240,0.72)'
      ctx.font = `500 22px ${SANS}`
      ctx.fillText('Your Business', 92, 470)
      ctx.fillText('+91 00000 00000', 92, 506)
    }
    ctx.fillStyle = foil(mode, GOLD)
    ctx.font = `700 20px ${SANS}`
    spaced(ctx, 'DESIGNATION', 94, 300, 8, 'left')
    ctx.fillRect(94, 340, 90, 2)
  },
  'minimal-back'(ctx, mode) {
    paperBase(ctx, mode, '#241F2C', '#151219', 61)
    ctx.textAlign = 'center'
    ctx.strokeStyle = foil(mode, GOLD)
    ctx.lineWidth = 2
    ctx.strokeRect(ART_W / 2 - 60, ART_H / 2 - 60, 120, 120)
    ctx.fillStyle = foil(mode, GOLD)
    ctx.font = `600 64px ${SERIF}`
    ctx.fillText('YN', ART_W / 2, ART_H / 2 + 22)
  },
}

/** Paints a face onto `canvas` (resizing it to the art size). */
export function paintFace(canvas: HTMLCanvasElement, id: FaceId, mode: Mode) {
  canvas.width = ART_W
  canvas.height = ART_H
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, ART_W, ART_H)
  PAINTERS[id](ctx, mode)
}

/**
 * Turns a foil mask into a roughness map: paper is matte (≈0.82), foil is smooth (≈0.22).
 * three.js reads roughness from the green channel.
 */
export function roughnessFromFoil(foilCanvas: HTMLCanvasElement, out: HTMLCanvasElement) {
  out.width = foilCanvas.width
  out.height = foilCanvas.height
  const ctx = out.getContext('2d')!
  ctx.drawImage(foilCanvas, 0, 0)
  const img = ctx.getImageData(0, 0, out.width, out.height)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const v = 210 - (d[i] / 255) * 154
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(img, 0, 0)
}

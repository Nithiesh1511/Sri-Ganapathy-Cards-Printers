import * as THREE from 'three'
import { BUSINESS } from '@/data/site'
import { Kit, type ProductModel } from './kit'
import {
  COLORS as C, F, pinwheel, pinwheelMono, circleText, halftone, barcode, rules, roundRect, paperGrain,
} from './art'

const TAU = Math.PI * 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => t * t * (3 - 2 * t)

/** Side texture for a block of sheets: fine horizontal lines, optionally banded in colours. */
function sheetEdge(bands: string[] = ['#ffffff'], pitch = 6) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    for (let y = 0; y < h; y += pitch) {
      ctx.fillStyle = bands[Math.floor(y / pitch) % bands.length]
      ctx.fillRect(0, y, w, pitch)
    }
    ctx.fillStyle = 'rgba(60,40,30,0.18)'
    for (let y = 0; y < h; y += pitch) ctx.fillRect(0, y, w, 1)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Visiting card
// ─────────────────────────────────────────────────────────────────────────────
function cardFront(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = C.cream; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h)
  pinwheel(ctx, w * 0.22, h * 0.5, h * 0.3)
  ctx.fillStyle = C.ink
  ctx.textBaseline = 'alphabetic'
  ctx.font = F.display(h * 0.17, true)
  ctx.fillText(BUSINESS.line1, w * 0.42, h * 0.44)
  ctx.font = F.sans(h * 0.055, 800)
  let x = w * 0.425
  for (const ch of 'CARDS & PRINTERS') { ctx.fillText(ch, x, h * 0.55); x += ctx.measureText(ch).width + h * 0.014 }
  ctx.fillStyle = C.gold; ctx.fillRect(w * 0.425, h * 0.6, w * 0.3, 3)
  ctx.fillStyle = C.ink
  ctx.font = F.sans(h * 0.06, 800)
  ctx.fillText(BUSINESS.phones[0].display, w * 0.425, h * 0.72)
  ctx.fillText(BUSINESS.phones[1].display, w * 0.66, h * 0.72)
  ctx.font = F.mono(h * 0.04)
  ctx.fillText(BUSINESS.email, w * 0.425, h * 0.82)
  ctx.fillText(`@${BUSINESS.instagram.handle}`, w * 0.425, h * 0.89)
  ctx.strokeStyle = 'rgba(200,150,46,0.7)'; ctx.lineWidth = 3
  roundRect(ctx, 22, 22, w - 44, h - 44, 18); ctx.stroke()
}

function cardBack(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#3a22a0'); g.addColorStop(1, '#1b0f52')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  halftone(ctx, 0, 0, w, h, 'rgba(255,255,255,0.12)', 22, 0.5, 'r')
  pinwheel(ctx, w / 2, h * 0.43, h * 0.3)
  ctx.fillStyle = '#EBD08F'
  ctx.textAlign = 'center'
  ctx.font = F.display(h * 0.085, true)
  ctx.fillText(BUSINESS.name, w / 2, h * 0.86)
  ctx.textAlign = 'left'
  ctx.strokeStyle = 'rgba(235,208,143,0.6)'; ctx.lineWidth = 3
  roundRect(ctx, 22, 22, w - 44, h - 44, 18); ctx.stroke()
}

export function buildVisitingCard(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const front = kit.tex(1400, 800, cardFront)
  const back = kit.tex(1400, 800, cardBack)
  const edge = kit.tex(8, 192, sheetEdge(['#fffdf8'], 4), { repeat: true })
  const sideMat = kit.paper(edge)
  const frontMat = kit.paper(front, { roughness: 0.55 })
  const backMat = kit.paper(back, { roughness: 0.55 })
  const plain = kit.paper(null, { color: 0xfffbf4 })

  // A thick block of cards.
  const stack = kit.mesh(kit.rbox(1.75, 0.34, 1.0, 0.01), [sideMat, sideMat, frontMat, plain, sideMat, sideMat])
  stack.position.set(-0.3, 0.17, -0.25)
  g.add(stack)

  // A loose card on top, turned to show the back.
  const loose = kit.mesh(kit.rbox(1.75, 0.014, 1.0, 0.01), [plain, plain, backMat, frontMat, plain, plain])
  loose.position.set(-0.18, 0.347, -0.22)
  loose.rotation.y = 0.32
  g.add(loose)

  // A card in a little display stand.
  const holder = kit.mesh(kit.rbox(1.95, 0.16, 0.34, 0.05), kit.mat({ color: 0x1d1830, roughness: 0.3, metalness: 0.55 }))
  holder.position.set(0.5, 0.08, 0.85)
  holder.rotation.y = -0.18
  g.add(holder)
  const standing = kit.mesh(kit.rbox(1.75, 1.0, 0.014, 0.04), [plain, plain, plain, plain, frontMat, backMat])
  standing.position.set(0, 0.57, 0)
  standing.rotation.x = -0.1
  holder.add(standing)
  standing.position.y = 0.58
  return { group: g, polar: 1.02 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Letterhead
// ─────────────────────────────────────────────────────────────────────────────
function letterheadArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h, 0.6)
  pinwheel(ctx, w * 0.13, h * 0.075, w * 0.085)
  ctx.fillStyle = C.irisDeep
  ctx.font = F.display(w * 0.075, true)
  ctx.fillText(BUSINESS.line1, w * 0.25, h * 0.073)
  ctx.fillStyle = C.ink
  ctx.font = F.sans(w * 0.026, 800)
  let x = w * 0.255
  for (const ch of 'CARDS & PRINTERS') { ctx.fillText(ch, x, h * 0.094); x += ctx.measureText(ch).width + w * 0.009 }
  ctx.font = F.mono(w * 0.024)
  ctx.textAlign = 'right'
  ctx.fillText(BUSINESS.phones[0].display, w * 0.93, h * 0.052)
  ctx.fillText(BUSINESS.phones[1].display, w * 0.93, h * 0.074)
  ctx.fillText(BUSINESS.email, w * 0.93, h * 0.096)
  ctx.textAlign = 'left'
  const bar = ctx.createLinearGradient(w * 0.07, 0, w * 0.93, 0)
  bar.addColorStop(0, C.cy); bar.addColorStop(0.33, C.mg); bar.addColorStop(0.66, C.ye); bar.addColorStop(1, C.ink)
  ctx.fillStyle = bar; ctx.fillRect(w * 0.07, h * 0.118, w * 0.86, h * 0.006)
  ctx.fillStyle = 'rgba(22,18,30,0.5)'
  ctx.font = F.sans(w * 0.026, 600)
  ctx.fillText('Date: ____ / ____ / ________', w * 0.07, h * 0.185)
  ctx.fillText('To,', w * 0.07, h * 0.235)
  rules(ctx, w * 0.07, h * 0.3, w * 0.86, 24, h * 0.0275, 'rgba(22,18,30,0.09)', 2)
  ctx.fillStyle = C.iris
  ctx.fillRect(0, h * 0.955, w, h * 0.045)
  ctx.fillStyle = '#fff'
  ctx.font = F.mono(w * 0.022)
  ctx.textAlign = 'center'
  ctx.fillText(`@${BUSINESS.instagram.handle}`, w / 2, h * 0.9825)
  ctx.textAlign = 'left'
}

function envelopeArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fbf3e6'; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h, 1.2)
  pinwheel(ctx, w * 0.1, h * 0.2, h * 0.12)
  ctx.fillStyle = C.irisDeep
  ctx.font = F.display(h * 0.11, true)
  ctx.fillText(BUSINESS.line1, w * 0.18, h * 0.19)
  rules(ctx, w * 0.45, h * 0.58, w * 0.45, 3, h * 0.12, 'rgba(22,18,30,0.3)', 3)
  ctx.fillStyle = 'rgba(22,18,30,0.5)'
  ctx.font = F.mono(h * 0.06)
  ctx.fillText('To,', w * 0.45, h * 0.52)
  // triangular flap seam
  ctx.strokeStyle = 'rgba(120,90,60,0.18)'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w / 2, h * 0.34); ctx.lineTo(w, 0); ctx.stroke()
}

export function buildLetterhead(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const art = kit.tex(1000, 1414, letterheadArt)
  const env = kit.tex(1200, 640, envelopeArt)
  const edge = kit.tex(8, 160, sheetEdge(['#ffffff'], 4), { repeat: true })
  const sideMat = kit.paper(edge)
  const top = kit.paper(art, { roughness: 0.7 })
  const plain = kit.paper(null, { color: 0xffffff })

  const W = 1.4, D = 1.98
  const stack = kit.mesh(kit.rbox(W, 0.2, D, 0.006, 2), [sideMat, sideMat, top, plain, sideMat, sideMat])
  stack.position.set(-0.28, 0.1, 0)
  g.add(stack)
  // Two loose sheets, slightly out of square — a hand has just been through them.
  for (const [dy, rot, ox, oz] of [[0.2 + 0.004, 0.06, 0.02, 0.03], [0.2 + 0.009, -0.045, -0.015, -0.02]] as const) {
    const s = kit.mesh(kit.rbox(W, 0.005, D, 0.003, 2), [plain, plain, top, plain, plain, plain])
    s.position.set(-0.28 + ox, dy, oz)
    s.rotation.y = rot
    g.add(s)
  }
  // An envelope tucked in beside the pad.
  const envMat = kit.paper(env, { roughness: 0.75 })
  const envelope = kit.mesh(kit.rbox(1.2, 0.02, 0.64, 0.01, 2), [plain, plain, envMat, plain, plain, plain])
  envelope.position.set(0.82, 0.012, 0.62)
  envelope.rotation.y = -0.5
  g.add(envelope)
  return { group: g, polar: 0.82 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bill book
// ─────────────────────────────────────────────────────────────────────────────
function billArt(ink: string, ink2: string) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = ink === C.iris ? '#fffdfa' : '#fde6ec'; ctx.fillRect(0, 0, w, h)
    paperGrain(ctx, w, h, 0.8)
    ctx.fillStyle = ink
    pinwheelMono(ctx, w * 0.13, h * 0.1, w * 0.07, ink)
    ctx.font = F.display(w * 0.065, true)
    ctx.fillText(BUSINESS.line1, w * 0.23, h * 0.095)
    ctx.font = F.sans(w * 0.026, 800)
    ctx.fillText('CASH / CREDIT BILL', w * 0.23, h * 0.125)
    ctx.fillStyle = ink2
    ctx.font = F.mono(w * 0.05, 500)
    ctx.textAlign = 'right'
    ctx.fillText('No. 0001', w * 0.92, h * 0.1)
    ctx.textAlign = 'left'
    ctx.strokeStyle = ink; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(w * 0.07, h * 0.15); ctx.lineTo(w * 0.93, h * 0.15); ctx.stroke()
    ctx.fillStyle = ink
    ctx.font = F.sans(w * 0.03, 600)
    ctx.fillText('Name :', w * 0.07, h * 0.2); ctx.fillText('Date :', w * 0.62, h * 0.2)
    rules(ctx, w * 0.18, h * 0.205, w * 0.4, 1, 0, ink, 2)
    rules(ctx, w * 0.72, h * 0.205, w * 0.21, 1, 0, ink, 2)
    // table
    const top = h * 0.235, bottom = h * 0.86
    const cols = [0.07, 0.17, 0.62, 0.72, 0.82, 0.93]
    ctx.lineWidth = 2.5
    ctx.strokeRect(w * 0.07, top, w * 0.86, bottom - top)
    cols.slice(1, -1).forEach((c) => { ctx.beginPath(); ctx.moveTo(w * c, top); ctx.lineTo(w * c, bottom); ctx.stroke() })
    rules(ctx, w * 0.07, top + h * 0.045, w * 0.86, 1, 0, ink, 2.5)
    rules(ctx, w * 0.07, top + h * 0.09, w * 0.86, 12, h * 0.045, ink === C.iris ? 'rgba(75,43,184,0.28)' : 'rgba(200,40,80,0.28)', 1.5)
    ctx.font = F.sans(w * 0.026, 800)
    ;(['S.No', 'Particulars', 'Qty', 'Rate', 'Amount'] as const).forEach((t, i) => {
      ctx.fillText(t, w * (cols[i] + 0.008), top + h * 0.032)
    })
    ctx.font = F.sans(w * 0.03, 800)
    ctx.fillText('Total', w * 0.64, h * 0.905)
    ctx.strokeRect(w * 0.72, h * 0.875, w * 0.21, h * 0.045)
    ctx.font = F.mono(w * 0.022)
    ctx.fillText('Thank you for your business', w * 0.07, h * 0.955)
    // perforation near the spine
    ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(w * 0.035, 0); ctx.lineTo(w * 0.035, h); ctx.stroke()
    ctx.setLineDash([])
  }
}

export function buildBillBook(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const topArt = kit.tex(900, 1160, billArt(C.iris, C.vermilion))
  const dupArt = kit.tex(900, 1160, billArt('#b0306a', C.vermilion))
  const edge = kit.tex(8, 192, sheetEdge(['#ffffff', '#fbd5dd', '#fff3b8'], 8), { repeat: true })
  const sideMat = kit.paper(edge)
  const topMat = kit.paper(topArt)
  const dupMat = kit.paper(dupArt)
  const plain = kit.paper(null, { color: 0xffffff })
  const kraft = kit.paper(null, { color: 0xb98a58, roughness: 0.95 })
  const cloth = kit.mat({ color: 0x15111f, roughness: 0.85 })

  const W = 1.35, D = 1.75, T = 0.42
  // Board backing and the pad of triplicate sheets.
  const back = kit.mesh(kit.rbox(W + 0.06, 0.035, D + 0.06, 0.006, 2), kraft)
  back.position.set(0, 0.0175, 0)
  g.add(back)
  const pad = kit.mesh(kit.rbox(W, T, D, 0.004, 2), [sideMat, sideMat, plain, plain, sideMat, sideMat])
  pad.position.set(0, 0.035 + T / 2, 0)
  g.add(pad)
  // The sheet on top is hinged along the spine and has been lifted — the pink copy shows beneath.
  const copy = kit.mesh(kit.rbox(W - 0.01, 0.004, D - 0.01, 0.002, 2), [plain, plain, dupMat, plain, plain, plain])
  copy.position.set(0, 0.035 + T + 0.003, 0)
  g.add(copy)
  const hinge = new THREE.Group()
  hinge.position.set(-W / 2 + 0.03, 0.035 + T + 0.008, 0)
  hinge.rotation.z = 0.17
  const lifted = kit.mesh(kit.rbox(W - 0.06, 0.004, D - 0.01, 0.002, 2), [plain, plain, topMat, plain, plain, plain])
  lifted.position.set((W - 0.06) / 2, 0, 0)
  hinge.add(lifted)
  g.add(hinge)
  // Cloth binding strip over the spine.
  const strip = kit.mesh(kit.rbox(0.16, T + 0.1, D + 0.06, 0.03), cloth)
  strip.position.set(-W / 2 - 0.02, 0.035 + (T + 0.1) / 2 - 0.03, 0)
  g.add(strip)
  return { group: g, polar: 0.85 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rubber stamp
// ─────────────────────────────────────────────────────────────────────────────
function sealArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2, cy = h / 2
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = '#3b2aa0'; ctx.fillStyle = '#3b2aa0'
  ctx.lineWidth = 10
  ctx.beginPath(); ctx.arc(cx, cy, w * 0.46, 0, TAU); ctx.stroke()
  ctx.lineWidth = 4
  ctx.beginPath(); ctx.arc(cx, cy, w * 0.425, 0, TAU); ctx.stroke()
  ctx.beginPath(); ctx.arc(cx, cy, w * 0.3, 0, TAU); ctx.stroke()
  ctx.font = F.sans(w * 0.065, 800)
  circleText(ctx, 'SRI GANAPATHY', cx, cy, w * 0.355, -Math.PI * 0.82, Math.PI * 0.82)
  ctx.font = F.sans(w * 0.052, 800)
  circleText(ctx, 'CARDS & PRINTERS', cx, cy, w * 0.365, Math.PI * 0.74, Math.PI * 1.26, true)
  ctx.fillRect(cx - w * 0.43, cy - 3, w * 0.07, 6); ctx.fillRect(cx + w * 0.36, cy - 3, w * 0.07, 6)
  pinwheelMono(ctx, cx, cy, w * 0.17, '#3b2aa0')
  // roughen the ink: a few specks knocked out
  ctx.globalCompositeOperation = 'destination-out'
  let s = 3
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 700; i++) { ctx.globalAlpha = 0.25 + rnd() * 0.5; ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, 0.6 + rnd() * 2.2, 0, TAU); ctx.fill() }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
}

export function buildStamp(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const seal = kit.tex(512, 512, sealArt)
  const sheetArt = kit.tex(800, 800, (ctx, w, h) => { ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, w, h); paperGrain(ctx, w, h); rules(ctx, w * 0.1, h * 0.88, w * 0.8, 1, 0, 'rgba(22,18,30,0.2)', 2) })

  // Sheet of paper being stamped.
  const sheet = kit.mesh(kit.rbox(2.1, 0.02, 1.9, 0.01, 2), kit.paper(sheetArt))
  sheet.position.set(0.1, 0.01, 0.15)
  sheet.rotation.y = 0.1
  g.add(sheet)
  const impressionMat = kit.mat({ map: seal, transparent: true, opacity: 0, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
  const impression = new THREE.Mesh(kit.plane(0.92, 0.92), impressionMat)
  impression.rotation.x = -Math.PI / 2
  impression.position.set(0.15, 0.0215, 0.1)
  impression.rotation.z = 0.35
  g.add(impression)

  // The stamp: turned wooden handle on a flange, rubber die beneath.
  const stamp = new THREE.Group()
  const pts = [
    [0.0, 0.0], [0.5, 0.0], [0.52, 0.02], [0.52, 0.2], [0.46, 0.24], [0.2, 0.28], [0.14, 0.36], [0.13, 0.62], [0.17, 0.8],
    [0.24, 0.94], [0.26, 1.08], [0.2, 1.22], [0.1, 1.28], [0.0, 1.3],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const lathe = kit.track(new THREE.LatheGeometry(new THREE.SplineCurve(pts).getPoints(90), 64))
  const wood = kit.track(new THREE.MeshPhysicalMaterial({ color: 0x8a4f26, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.25 }))
  const handle = kit.mesh(lathe, wood)
  handle.position.y = 0.06
  stamp.add(handle)
  const die = kit.mesh(kit.cyl(0.46, 0.46, 0.06, 56), kit.mat({ color: 0x141018, roughness: 0.9 }))
  die.position.y = 0.03
  stamp.add(die)
  const ring = kit.mesh(kit.track(new THREE.TorusGeometry(0.2, 0.025, 12, 40)), kit.mat({ color: 0xd9ad43, metalness: 1, roughness: 0.3 }))
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.52
  stamp.add(ring)
  stamp.position.set(0.15, 0.7, 0.1)
  g.add(stamp)

  // Ink pad: a tin with indigo ink.
  const pad = new THREE.Group()
  const tin = kit.mesh(kit.rbox(1.15, 0.2, 0.85, 0.06), kit.mat({ color: 0xcfd2da, metalness: 0.9, roughness: 0.3 }))
  tin.position.y = 0.1
  pad.add(tin)
  const ink = kit.mesh(kit.rbox(0.98, 0.02, 0.7, 0.03), kit.mat({ color: 0x3320a3, roughness: 0.12, metalness: 0.2 }), false)
  ink.position.y = 0.205
  pad.add(ink)
  pad.position.set(-1.35, 0, -0.65)
  pad.rotation.y = 0.3
  g.add(pad)

  const T = 5.2
  return {
    group: g,
    polar: 1.12,
    update(t) {
      // press cycle: hover → down → dwell → up
      const k = (t % T) / T
      let down = 0
      if (k < 0.18) down = ease(k / 0.18)
      else if (k < 0.34) down = 1
      else if (k < 0.5) down = 1 - ease((k - 0.34) / 0.16)
      stamp.position.y = lerp(0.85, 0.12, down)
      stamp.rotation.z = (1 - down) * 0.05 * Math.sin(t * 1.3)
      const stamped = k > 0.17 && k < 1
      const target = stamped ? 0.9 : 0
      impressionMat.opacity += (target - impressionMat.opacity) * (stamped ? 0.4 : 0.12)
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ID card
// ─────────────────────────────────────────────────────────────────────────────
function idFront(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h)
  const band = ctx.createLinearGradient(0, 0, w, 0)
  band.addColorStop(0, '#3a22a0'); band.addColorStop(1, '#6a47d6')
  ctx.fillStyle = band; ctx.fillRect(0, 0, w, h * 0.19)
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(w * 0.17, h * 0.095, h * 0.06, 0, TAU); ctx.fill()
  ctx.fillStyle = C.iris
  ctx.font = F.display(h * 0.045, true)
  ctx.fillText('S', w * 0.145, h * 0.108)
  ctx.fillStyle = '#fff'
  ctx.font = F.sans(h * 0.036, 800)
  ctx.fillText('YOUR SCHOOL NAME', w * 0.3, h * 0.085)
  ctx.font = F.mono(h * 0.024)
  ctx.fillText('IDENTITY CARD', w * 0.3, h * 0.125)
  // photo
  ctx.fillStyle = '#e8e4f7'; roundRect(ctx, w * 0.27, h * 0.24, w * 0.46, h * 0.3, 14); ctx.fill()
  ctx.fillStyle = '#b8b0e0'
  ctx.beginPath(); ctx.arc(w * 0.5, h * 0.36, h * 0.06, 0, TAU); ctx.fill()
  ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.52, h * 0.1, h * 0.085, 0, Math.PI, 0); ctx.fill()
  ctx.strokeStyle = C.iris; ctx.lineWidth = 5; roundRect(ctx, w * 0.27, h * 0.24, w * 0.46, h * 0.3, 14); ctx.stroke()
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'
  ctx.font = F.display(h * 0.05, false, 700)
  ctx.fillText('STUDENT NAME', w / 2, h * 0.6)
  ctx.textAlign = 'left'
  ctx.font = F.sans(h * 0.03, 600)
  const rows: [string, string][] = [['Class', 'X - A'], ['Roll No', '07'], ['Blood', 'O +'], ['Phone', '00000 00000']]
  rows.forEach(([k, v], i) => {
    ctx.fillStyle = 'rgba(22,18,30,0.55)'; ctx.fillText(k, w * 0.14, h * (0.665 + i * 0.044))
    ctx.fillStyle = C.ink; ctx.fillText(`:  ${v}`, w * 0.36, h * (0.665 + i * 0.044))
  })
  barcode(ctx, w * 0.14, h * 0.875, w * 0.72, h * 0.06, C.ink, 9)
  ctx.fillStyle = C.mg; ctx.fillRect(0, h * 0.965, w * 0.25, h * 0.035)
  ctx.fillStyle = C.ye; ctx.fillRect(w * 0.25, h * 0.965, w * 0.25, h * 0.035)
  ctx.fillStyle = C.cy; ctx.fillRect(w * 0.5, h * 0.965, w * 0.25, h * 0.035)
  ctx.fillStyle = C.ink; ctx.fillRect(w * 0.75, h * 0.965, w * 0.25, h * 0.035)
}

function idBack(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f5f2fd'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = C.iris; ctx.fillRect(0, h * 0.94, w, h * 0.06)
  ctx.fillStyle = C.ink
  ctx.font = F.sans(h * 0.034, 800)
  ctx.fillText('IF FOUND, PLEASE RETURN TO', w * 0.1, h * 0.12)
  ctx.font = F.sans(h * 0.03, 500)
  rules(ctx, w * 0.1, h * 0.19, w * 0.8, 3, h * 0.045, 'rgba(22,18,30,0.3)', 2)
  ctx.fillStyle = 'rgba(22,18,30,0.6)'
  ctx.font = F.mono(h * 0.024)
  ;['This card is the property of the institution.', 'It is non-transferable and must be', 'worn at all times on the premises.'].forEach((t, i) => ctx.fillText(t, w * 0.1, h * (0.4 + i * 0.045)))
  pinwheel(ctx, w * 0.5, h * 0.68, h * 0.1)
  barcode(ctx, w * 0.12, h * 0.82, w * 0.76, h * 0.07, C.ink, 4)
}

export function buildIdCard(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const front = kit.tex(640, 1000, idFront)
  const back = kit.tex(640, 1000, idBack)
  const plastic = (map: THREE.Texture | null) => kit.track(new THREE.MeshPhysicalMaterial({ map, color: map ? 0xffffff : 0xf5f2fd, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }))
  const plain = plastic(null)

  const W = 0.9, H = 1.4
  const card = new THREE.Group()
  const body = kit.mesh(kit.rbox(W, H, 0.03, 0.07), [plain, plain, plain, plain, plastic(front), plastic(back)])
  card.add(body)
  // slot punched at the top, with a metal clip through it
  const clip = kit.mesh(kit.rbox(0.2, 0.07, 0.05, 0.015), kit.mat({ color: 0xd9dbe2, metalness: 1, roughness: 0.22 }))
  clip.position.set(0, H / 2 - 0.03, 0)
  card.add(clip)
  const lug = kit.mesh(kit.track(new THREE.TorusGeometry(0.06, 0.016, 10, 24)), kit.mat({ color: 0xd9dbe2, metalness: 1, roughness: 0.22 }))
  lug.position.set(0, H / 2 + 0.07, 0)
  card.add(lug)
  card.position.set(0, 0.17 + H / 2 - 0.04, 0)
  card.rotation.x = -0.05
  g.add(card)

  // display block
  const block = kit.mesh(kit.rbox(1.05, 0.17, 0.4, 0.05), kit.mat({ color: 0x1d1830, roughness: 0.3, metalness: 0.55 }))
  block.position.set(0, 0.085, 0)
  g.add(block)

  // lanyard: a flattened tube in a long loop
  const loopPts = [
    [0, 1.64, 0.01], [0.24, 1.86, 0], [0.38, 2.14, -0.02], [0.2, 2.42, -0.05],
    [0, 2.52, -0.06], [-0.2, 2.42, -0.05], [-0.38, 2.14, -0.02], [-0.24, 1.86, 0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z))
  const curve = new THREE.CatmullRomCurve3(loopPts, true, 'catmullrom', 0.5)
  const strap = kit.tex(1024, 64, (ctx, w, h) => {
    ctx.fillStyle = '#3a22a0'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = F.sans(h * 0.48, 800)
    ctx.textBaseline = 'middle'
    ctx.fillText('YOUR SCHOOL  ✦  YOUR SCHOOL  ✦  YOUR SCHOOL  ✦  YOUR SCHOOL  ✦', 8, h / 2)
  }, { repeat: true })
  strap.repeat.set(3, 1)
  const lanyard = kit.mesh(kit.track(new THREE.TubeGeometry(curve, 120, 0.06, 8, true)), kit.mat({ map: strap, roughness: 0.6 }))
  lanyard.scale.z = 0.3
  g.add(lanyard)
  return { group: g, polar: 1.3 }
}

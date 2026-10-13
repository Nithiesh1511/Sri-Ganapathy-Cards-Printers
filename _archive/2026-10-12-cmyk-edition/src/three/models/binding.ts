import * as THREE from 'three'
import { BUSINESS } from '@/data/site'
import { Kit, type ProductModel } from './kit'
import { COLORS as C, F, pinwheel, pinwheelMono, halftone, roundRect, leatherBump, paperGrain } from './art'
import { hardcover, pageEdgeTex } from './books'

const TAU = Math.PI * 2

// ─────────────────────────────────────────────────────────────────────────────
// Paper & charts
// ─────────────────────────────────────────────────────────────────────────────
function chartArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fffdf6'; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h)
  const band = ctx.createLinearGradient(0, 0, w, 0)
  band.addColorStop(0, C.mg); band.addColorStop(0.5, '#7a1fa8'); band.addColorStop(1, C.iris)
  ctx.fillStyle = band; ctx.fillRect(0, 0, w, h * 0.16)
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
  ctx.font = F.display(h * 0.085, true, 700)
  ctx.fillText('Alphabet Chart', w / 2, h * 0.108)
  const pastel = ['#ffd6e7', '#fff1a8', '#c9ecff', '#d8f5c8', '#e6d9ff', '#ffe0c2']
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'
  const cols = 6, rows = 4
  const pad = w * 0.04, gx = (w - pad * 2) / cols, gy = (h * 0.8 - pad) / rows
  for (let i = 0; i < letters.length; i++) {
    const cx = pad + (i % cols) * gx, cy = h * 0.19 + Math.floor(i / cols) * gy
    ctx.fillStyle = pastel[i % pastel.length]
    roundRect(ctx, cx + 6, cy + 6, gx - 12, gy - 12, 14); ctx.fill()
    ctx.fillStyle = C.irisDeep
    ctx.font = F.display(gy * 0.5, false, 700)
    ctx.fillText(letters[i], cx + gx / 2, cy + gy * 0.6)
    ctx.fillStyle = [C.cy, C.mg, C.ye, C.ink][i % 4]
    ctx.beginPath(); ctx.arc(cx + gx / 2, cy + gy * 0.82, gy * 0.05, 0, TAU); ctx.fill()
  }
  ctx.textAlign = 'left'
}

function spiralEnd(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f4ecdc'; ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(110,90,70,0.55)'; ctx.lineWidth = 2
  ctx.beginPath()
  for (let a = 0; a < Math.PI * 2 * 11; a += 0.1) {
    const r = (a / (Math.PI * 2 * 11)) * w * 0.5
    const x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r
    if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.fillStyle = '#2a2018'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.045, 0, TAU); ctx.fill()
}

export function buildPaperCharts(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const LEN = 1.95, R = 0.17
  const rollColors = [0xffe27a, 0xffa9cb, 0x9fd8ff, 0xb9e59a, 0xc9b6f5, 0xffd9a8]
  const endTex = kit.tex(256, 256, spiralEnd)
  const endMat = kit.paper(endTex)
  const place: [number, number, number][] = [
    [-0.34, R, 0], [0, R, 0], [0.34, R, 0],
    [-0.17, R + 0.295, 0], [0.17, R + 0.295, 0],
    [0, R + 0.59, 0],
  ]
  place.forEach(([x, y, z], i) => {
    const wall = kit.mesh(kit.cyl(R, R, LEN, 40, true), kit.paper(null, { color: rollColors[i % rollColors.length], side: THREE.DoubleSide, roughness: 0.85 }))
    wall.rotation.x = Math.PI / 2
    wall.position.set(x, y, z)
    g.add(wall)
    for (const sz of [-1, 1]) {
      const cap = new THREE.Mesh(kit.track(new THREE.CircleGeometry(R * 0.98, 32)), endMat)
      cap.position.set(x, y, sz * (LEN / 2 - 0.012))
      cap.rotation.y = sz > 0 ? 0 : Math.PI
      g.add(cap)
    }
  })
  // two ribbons tying the bundle
  const tie = kit.mat({ color: 0xec008c, roughness: 0.5 })
  for (const z of [-0.55, 0.55]) {
    const ribbon = kit.mesh(kit.track(new THREE.TorusGeometry(0.5, 0.022, 10, 48)), tie)
    ribbon.position.set(0, 0.4, z)
    ribbon.scale.set(1, 0.98, 1)
    g.add(ribbon)
  }

  // a chart on dowels, standing behind
  const sheet = kit.mesh(kit.plane(2.0, 1.4), kit.paper(kit.tex(1100, 770, chartArt), { side: THREE.DoubleSide }))
  const hang = new THREE.Group()
  hang.add(sheet)
  const dowel = kit.mat({ color: 0xb98a58, roughness: 0.6 })
  for (const y of [0.7, -0.7]) {
    const d = kit.mesh(kit.cyl(0.03, 0.03, 2.1, 16), dowel)
    d.rotation.z = Math.PI / 2
    d.position.y = y
    hang.add(d)
  }
  hang.position.set(0.1, 0.78, -1.05)
  hang.rotation.set(-0.1, 0.1, 0)
  g.add(hang)
  const legMat = kit.mat({ color: 0x2a2540, metalness: 0.7, roughness: 0.4 })
  for (const sx of [-0.85, 0.95]) {
    const leg = kit.mesh(kit.cyl(0.03, 0.03, 1.6, 12), legMat)
    leg.position.set(sx, 0.8, -1.2)
    g.add(leg)
  }
  return { group: g, polar: 1.05 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Book binding
// ─────────────────────────────────────────────────────────────────────────────
export function buildBookBinding(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const a = hardcover(kit, {
    w: 1.25, h: 1.8, t: 0.52, color: 0x16295e, bump: 'linen',
    title: ['Project', 'Report'], tagline: 'ACADEMIC YEAR', spine: 'PROJECT REPORT', ribbon: 0xd8221f, mark: true,
  })
  a.position.set(-0.5, 0, -0.1)
  a.rotation.y = 0.32
  g.add(a)
  // a second, thinner volume lying flat
  const b = hardcover(kit, {
    w: 1.15, h: 1.6, t: 0.3, color: 0x0f5a3c, bump: 'linen',
    title: ['Ledger'], tagline: 'ACCOUNTS', spine: 'LEDGER', ribbon: 0xffd400,
  })
  const flat = new THREE.Group()
  b.rotation.x = -Math.PI / 2
  b.position.set(0, 0.15, 0.8)
  flat.add(b)
  flat.position.set(0.82, 0, 0.1)
  flat.rotation.y = -0.45
  g.add(flat)
  // a third, tall slim book leaning
  const c = hardcover(kit, {
    w: 0.95, h: 1.55, t: 0.26, color: 0x7a1038, bump: 'linen', title: ['Notes'], spine: 'NOTES',
  })
  c.position.set(0.15, 0, -0.95)
  c.rotation.set(0, -0.2, -0.1)
  g.add(c)
  return { group: g, polar: 1.12 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rexin binding
// ─────────────────────────────────────────────────────────────────────────────
function rexinTop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#7d1a38'); g.addColorStop(1, '#4e0d22')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  // embossed inner frame (lighter + darker edges)
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(255,170,190,0.28)'; roundRect(ctx, 86, 86, w - 172, h - 172, 20); ctx.stroke()
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, 92, 92, w - 184, h - 184, 18); ctx.stroke()
  // stitched border
  ctx.setLineDash([22, 14]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(245,225,190,0.85)'
  roundRect(ctx, 44, 44, w - 88, h - 88, 18); ctx.stroke()
  ctx.setLineDash([])
}

function rexinFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  pinwheelMono(ctx, w / 2, h * 0.27, w * 0.11, '#fff')
  ctx.font = F.display(w * 0.14, true, 600)
  ctx.fillText('Ledger', w / 2, h * 0.5)
  ctx.font = F.mono(w * 0.035, 500)
  ctx.fillText('A C C O U N T S   &   R E C O R D S', w / 2, h * 0.585)
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(w * 0.25, h * 0.64); ctx.lineTo(w * 0.75, h * 0.64); ctx.stroke()
  ctx.font = F.display(w * 0.06, true, 500)
  ctx.fillText(BUSINESS.line1, w / 2, h * 0.88)
  ctx.textAlign = 'left'
}

export function buildRexinBinding(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const W = 1.75, D = 2.25, T = 0.62
  const bump = kit.tex(256, 256, leatherBump, { repeat: true, data: true })
  bump.repeat.set(5, 6)
  const rexin = kit.track(new THREE.MeshPhysicalMaterial({ color: 0x6d1530, roughness: 0.5, bumpMap: bump, bumpScale: 2.2, clearcoat: 0.35, clearcoatRoughness: 0.45 }))
  const top = kit.track(new THREE.MeshPhysicalMaterial({ map: kit.tex(1000, 1288, rexinTop), roughness: 0.5, bumpMap: bump, bumpScale: 2.0, clearcoat: 0.35, clearcoatRoughness: 0.45 }))

  const topBoard = kit.mesh(kit.rbox(W, 0.06, D, 0.05), [rexin, rexin, top, rexin, rexin, rexin])
  topBoard.position.set(0, T - 0.03, 0)
  g.add(topBoard)
  const bottomBoard = kit.mesh(kit.rbox(W, 0.06, D, 0.05), rexin)
  bottomBoard.position.set(0, 0.03, 0)
  g.add(bottomBoard)
  const spine = kit.mesh(kit.rbox(0.2, T, D, 0.07), rexin)
  spine.position.set(-W / 2 + 0.1, T / 2, 0)
  g.add(spine)
  // page block
  const edge = pageEdgeTex(kit)
  const pageMat = kit.paper(edge, { roughness: 0.9 })
  const hidden = kit.paper(null, { color: 0xfaf4e6 })
  const pages = kit.mesh(kit.rbox(W - 0.28, T - 0.1, D - 0.1, 0.008, 2), [pageMat, hidden, hidden, hidden, pageMat, pageMat])
  pages.position.set(0.06, T / 2, 0)
  g.add(pages)

  const foil = new THREE.Mesh(kit.plane(W - 0.46, D - 0.4), kit.foilMat(kit.tex(740, 980, rexinFoil)))
  foil.rotation.x = -Math.PI / 2
  foil.position.set(0.09, T + 0.003, 0)
  g.add(foil)

  // gold corner protectors
  const tri = new THREE.Shape()
  tri.moveTo(0, 0); tri.lineTo(0.3, 0); tri.lineTo(0, 0.3); tri.closePath()
  const triGeo = kit.track(new THREE.ExtrudeGeometry(tri, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }))
  const gold = kit.mat({ color: 0xe0b44a, metalness: 1, roughness: 0.25 })
  for (const [sx, sz, rot] of [[-1, -1, 0], [1, -1, -Math.PI / 2], [1, 1, Math.PI], [-1, 1, Math.PI / 2]] as const) {
    const c = kit.mesh(triGeo, gold)
    c.rotation.set(Math.PI / 2, 0, 0) // lie flat, extending +x and +z from the corner
    const holder = new THREE.Group()
    holder.add(c)
    holder.rotation.y = rot
    holder.position.set(sx * (W / 2 - 0.015), T + 0.022, sz * (D / 2 - 0.015))
    g.add(holder)
  }
  // ribbon marker
  const rib = kit.mesh(kit.box(0.05, 0.012, 0.6), kit.mat({ color: 0xffd400, roughness: 0.5 }))
  rib.position.set(0.3, 0.25, D / 2 + 0.25)
  rib.rotation.x = 0.1
  g.add(rib)
  return { group: g, polar: 0.9 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart binding
// ─────────────────────────────────────────────────────────────────────────────
function barChartArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fffdf6'; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h)
  ctx.fillStyle = C.iris; ctx.fillRect(0, 0, w, h * 0.13)
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
  ctx.font = F.display(h * 0.065, true, 700)
  ctx.fillText('Class Performance', w / 2, h * 0.088)
  // axes
  const x0 = w * 0.12, y0 = h * 0.86, x1 = w * 0.92, y1 = h * 0.22
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke()
  ctx.strokeStyle = 'rgba(22,18,30,0.15)'; ctx.lineWidth = 2
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 - ((y0 - y1) * i) / 6); ctx.lineTo(x1, y0 - ((y0 - y1) * i) / 6); ctx.stroke() }
  const vals = [0.5, 0.74, 0.9, 0.62, 0.8]
  const cols = [C.cy, C.mg, C.ye, C.iris, C.vermilion]
  vals.forEach((v, i) => {
    const bw = (x1 - x0) / vals.length
    ctx.fillStyle = cols[i]
    ctx.fillRect(x0 + i * bw + bw * 0.15, y0 - (y0 - y1) * v, bw * 0.7, (y0 - y1) * v)
    ctx.fillStyle = C.ink; ctx.font = F.mono(h * 0.03)
    ctx.fillText(String.fromCharCode(65 + i), x0 + i * bw + bw / 2, y0 + h * 0.04)
  })
  ctx.textAlign = 'left'
}

export function buildChartBinding(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const wood = kit.mat({ color: 0xb98a58, roughness: 0.55 })
  const metal = kit.mat({ color: 0xcfd3dc, metalness: 1, roughness: 0.28 })
  const TOP = 2.85
  // easel: two splayed front legs, a rear leg, a crossbar and a top beam
  for (const sx of [-1, 1]) {
    const leg = kit.mesh(kit.rbox(0.07, 2.95, 0.07, 0.02), wood)
    leg.position.set(sx * 0.95, 1.45, 0.12)
    leg.rotation.z = sx * -0.04
    g.add(leg)
  }
  const beam = kit.mesh(kit.rbox(2.0, 0.09, 0.1, 0.02), wood)
  beam.position.set(0, TOP + 0.04, 0.12)
  g.add(beam)
  const cross = kit.mesh(kit.rbox(1.9, 0.07, 0.07, 0.02), wood)
  cross.position.set(0, 0.55, 0.12)
  g.add(cross)
  const rear = kit.mesh(kit.rbox(0.07, 3.0, 0.07, 0.02), wood)
  rear.position.set(0, 1.4, -0.7)
  rear.rotation.x = 0.36
  g.add(rear)

  // the bound set of charts hangs from a binding strip
  const strip = kit.mesh(kit.rbox(1.62, 0.14, 0.09, 0.03), kit.mat({ color: 0x15111f, roughness: 0.5 }))
  strip.position.set(0, TOP - 0.1, 0.22)
  g.add(strip)
  for (const sx of [-0.55, 0.55]) {
    const hook = kit.mesh(kit.track(new THREE.TorusGeometry(0.07, 0.015, 10, 24)), metal)
    hook.position.set(sx, TOP + 0.02, 0.22)
    hook.rotation.y = Math.PI / 2
    g.add(hook)
    const gr = kit.mesh(kit.track(new THREE.TorusGeometry(0.03, 0.012, 8, 16)), metal)
    gr.position.set(sx, TOP - 0.1, 0.27)
    g.add(gr)
  }
  const art = kit.paper(kit.tex(750, 1000, barChartArt), { side: THREE.DoubleSide })
  const blank = kit.paper(null, { color: 0xfffdf6, side: THREE.DoubleSide })
  const SH_W = 1.5, SH_H = 2.0
  for (let i = 0; i <= 6; i++) {
    const sheet = kit.mesh(kit.plane(SH_W, SH_H), i === 6 ? art : blank)
    const pivot = new THREE.Group()
    pivot.position.set(0, TOP - 0.16, 0.2 + i * 0.012)
    sheet.position.y = -SH_H / 2
    pivot.add(sheet)
    pivot.rotation.x = -0.1 + i * 0.012
    g.add(pivot)
  }
  return { group: g, polar: 1.22 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Spiral binding
// ─────────────────────────────────────────────────────────────────────────────
function spiralCover(title: string, c1: string, c2: string, light: boolean) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, c1); g.addColorStop(1, c2)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    halftone(ctx, 0, h * 0.5, w, h * 0.5, light ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.14)', 22, 0.5, 'y')
    pinwheel(ctx, w * 0.5, h * 0.3, w * 0.2)
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
    ctx.font = F.display(w * 0.15, true, 600)
    ctx.fillText(title, w / 2, h * 0.66)
    ctx.font = F.mono(w * 0.04, 500)
    ctx.fillText(BUSINESS.line1.toUpperCase(), w / 2, h * 0.74)
    // punched holes along the spine edge
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    for (let y = h * 0.04; y < h; y += h / 24) { ctx.beginPath(); ctx.arc(w * 0.04, y + h * 0.01, w * 0.012, 0, TAU); ctx.fill() }
    ctx.textAlign = 'left'
  }
}

function spiralNotebook(kit: Kit, W: number, D: number, T: number, cover: THREE.Texture, coilColor: number): THREE.Group {
  const g = new THREE.Group()
  const gloss = kit.track(new THREE.MeshPhysicalMaterial({ map: cover, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3 }))
  const board = kit.paper(null, { color: 0x2a2540, roughness: 0.6 })
  const edge = pageEdgeTex(kit)
  const pageMat = kit.paper(edge, { roughness: 0.9 })
  const hidden = kit.paper(null, { color: 0xfaf4e6 })
  const back = kit.mesh(kit.rbox(W, 0.03, D, 0.02), board)
  back.position.y = 0.015
  g.add(back)
  const pages = kit.mesh(kit.rbox(W - 0.06, T - 0.07, D - 0.06, 0.006, 2), [pageMat, hidden, hidden, hidden, pageMat, pageMat])
  pages.position.set(0.02, T / 2, 0)
  g.add(pages)
  const front = kit.mesh(kit.rbox(W, 0.03, D, 0.02), [board, board, gloss, board, board, board])
  front.position.y = T - 0.015
  g.add(front)
  // the coil
  const coil = kit.mat({ color: coilColor, metalness: 0.7, roughness: 0.28 })
  const ringGeo = kit.track(new THREE.TorusGeometry(T / 2 + 0.035, 0.016, 10, 28))
  const holes = 24
  for (let i = 0; i < holes; i++) {
    const r = new THREE.Mesh(ringGeo, coil)
    r.castShadow = true
    r.position.set(-W / 2 + 0.04, T / 2, -D / 2 + 0.07 + (i * (D - 0.14)) / (holes - 1))
    r.rotation.y = 0.32
    g.add(r)
  }
  return g
}

export function buildSpiralBinding(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const a = spiralNotebook(kit, 1.55, 2.1, 0.34, kit.tex(780, 1060, spiralCover('Notebook', '#4b2bb8', '#1d1060', false)), 0xd8dbe4)
  a.position.set(-0.1, 0, 0)
  a.rotation.y = 0.15
  g.add(a)
  const b = spiralNotebook(kit, 1.2, 1.6, 0.22, kit.tex(620, 820, spiralCover('Notes', '#ec008c', '#8a0a5c', true)), 0x2a2540)
  b.position.set(0.12, 0.34, 0.08)
  b.rotation.y = -0.42
  g.add(b)
  return { group: g, polar: 0.9 }
}

